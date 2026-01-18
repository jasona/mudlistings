/**
 * MSSP (MUD Server Status Protocol) Polling Job
 *
 * This script polls all MUDs with connection info to check their online status
 * and retrieve MSSP data. Run via cron every 5 minutes.
 *
 * Usage: npx tsx jobs/mssp-poll.ts
 */

import { PrismaClient } from "@prisma/client";
import * as net from "net";

const prisma = new PrismaClient();

const MSSP_REQUEST = "\xFF\xFD\x46"; // IAC DO MSSP
const TIMEOUT_MS = 10000; // 10 second timeout
const MAX_CONSECUTIVE_FAILURES = 3;

interface MsspData {
  name?: string;
  players?: number;
  uptime?: number;
  hostname?: string;
  port?: number;
  codebase?: string;
  [key: string]: string | number | undefined;
}

interface PollResult {
  isOnline: boolean;
  data?: MsspData;
  error?: string;
}

async function checkMsspStatus(
  host: string,
  port: number
): Promise<PollResult> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let buffer = Buffer.alloc(0);
    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
      }
    };

    socket.setTimeout(TIMEOUT_MS);

    socket.on("connect", () => {
      // Send MSSP request
      socket.write(Buffer.from(MSSP_REQUEST, "binary"));
    });

    socket.on("data", (data) => {
      buffer = Buffer.concat([buffer, data]);

      // Look for MSSP response (starts with IAC SB MSSP)
      const msspStart = buffer.indexOf(Buffer.from([0xff, 0xfa, 0x46]));
      if (msspStart !== -1) {
        // Find the end (IAC SE)
        const msspEnd = buffer.indexOf(Buffer.from([0xff, 0xf0]), msspStart);
        if (msspEnd !== -1) {
          const msspPayload = buffer.slice(msspStart + 3, msspEnd);
          const data = parseMsspData(msspPayload);
          cleanup();
          resolve({ isOnline: true, data });
          return;
        }
      }

      // If we've received enough data without MSSP, server is online but no MSSP
      if (buffer.length > 1000) {
        cleanup();
        resolve({ isOnline: true });
      }
    });

    socket.on("timeout", () => {
      cleanup();
      resolve({ isOnline: false, error: "Connection timeout" });
    });

    socket.on("error", (err) => {
      cleanup();
      resolve({ isOnline: false, error: err.message });
    });

    socket.on("close", () => {
      if (!resolved) {
        // Server accepted connection but closed - still online
        resolve({ isOnline: buffer.length > 0 });
      }
    });

    try {
      socket.connect(port, host);
    } catch (err) {
      cleanup();
      resolve({
        isOnline: false,
        error: err instanceof Error ? err.message : "Connection failed",
      });
    }
  });
}

function parseMsspData(payload: Buffer): MsspData {
  const data: MsspData = {};
  let i = 0;

  while (i < payload.length) {
    // MSSP_VAR (1) marks start of variable name
    if (payload[i] === 1) {
      i++;
      let varName = "";
      while (i < payload.length && payload[i] !== 2 && payload[i] !== 1) {
        varName += String.fromCharCode(payload[i]);
        i++;
      }

      // MSSP_VAL (2) marks start of value
      if (i < payload.length && payload[i] === 2) {
        i++;
        let value = "";
        while (i < payload.length && payload[i] !== 1 && payload[i] !== 2) {
          value += String.fromCharCode(payload[i]);
          i++;
        }

        // Store the value
        const key = varName.toLowerCase();
        if (key === "players" || key === "uptime" || key === "port") {
          const num = parseInt(value, 10);
          if (!isNaN(num)) {
            data[key] = num;
          }
        } else {
          data[key] = value;
        }
      }
    } else {
      i++;
    }
  }

  return data;
}

async function pollAllMuds() {
  console.log("Starting MSSP poll job...");

  const muds = await prisma.mud.findMany({
    where: {
      isDeleted: false,
      connectionHost: { not: null },
      connectionPort: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      connectionHost: true,
      connectionPort: true,
      consecutiveFailures: true,
      isOnline: true,
    },
  });

  console.log(`Found ${muds.length} MUDs to poll`);

  let onlineCount = 0;
  let offlineCount = 0;
  let errorCount = 0;

  for (const mud of muds) {
    if (!mud.connectionHost || !mud.connectionPort) continue;

    try {
      console.log(`Polling ${mud.name} (${mud.connectionHost}:${mud.connectionPort})...`);

      const result = await checkMsspStatus(
        mud.connectionHost,
        mud.connectionPort
      );

      if (result.isOnline) {
        onlineCount++;
        console.log(`  ✓ Online${result.data?.players !== undefined ? ` (${result.data.players} players)` : ""}`);

        await prisma.mud.update({
          where: { id: mud.id },
          data: {
            isOnline: true,
            lastOnlineCheck: new Date(),
            consecutiveFailures: 0,
            currentMsspData: result.data || null,
          },
        });

        // Record status history
        await prisma.mudStatus.create({
          data: {
            mudId: mud.id,
            isOnline: true,
            playerCount: result.data?.players,
            uptime: result.data?.uptime
              ? BigInt(result.data.uptime)
              : undefined,
            msspDataJson: result.data || undefined,
          },
        });

        // Create activity event if MUD came back online
        if (!mud.isOnline) {
          await prisma.activityEvent.create({
            data: {
              type: "STATUS_CHANGE",
              mudId: mud.id,
              description: `${mud.name} is back online`,
            },
          });
        }
      } else {
        offlineCount++;
        console.log(`  ✗ Offline: ${result.error || "Unknown error"}`);

        const newFailureCount = mud.consecutiveFailures + 1;
        const shouldMarkOffline = newFailureCount >= MAX_CONSECUTIVE_FAILURES;

        await prisma.mud.update({
          where: { id: mud.id },
          data: {
            consecutiveFailures: newFailureCount,
            lastOnlineCheck: new Date(),
            isOnline: shouldMarkOffline ? false : mud.isOnline,
          },
        });

        // Record offline status
        await prisma.mudStatus.create({
          data: {
            mudId: mud.id,
            isOnline: false,
          },
        });

        // Create activity event if MUD went offline
        if (mud.isOnline && shouldMarkOffline) {
          await prisma.activityEvent.create({
            data: {
              type: "STATUS_CHANGE",
              mudId: mud.id,
              description: `${mud.name} appears to be offline`,
            },
          });
        }
      }
    } catch (error) {
      errorCount++;
      console.error(`  Error polling ${mud.name}:`, error);
    }

    // Small delay between polls to avoid overwhelming servers
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n--- Poll Summary ---");
  console.log(`Online: ${onlineCount}`);
  console.log(`Offline: ${offlineCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${muds.length}`);
}

// Run the job
pollAllMuds()
  .then(() => {
    console.log("\nMSSP poll job completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMSSP poll job failed:", error);
    process.exit(1);
  });
