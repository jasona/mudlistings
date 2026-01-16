import { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/features/animated-card';
import { useCreateMud, useImportMuds } from '@/hooks/use-site-admin';
import { useGenres } from '@/hooks/use-muds';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Genre } from '@/types';

type ImportResult = {
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; message: string }>;
};

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for manual creation
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    fullDescription: '',
    host: '',
    port: '',
    websiteUrl: '',
    codebaseId: '',
    genreId: '',
  });

  const { data: genres } = useGenres();
  const createMud = useCreateMud();
  const importMuds = useImportMuds();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      toast.error('Please upload a JSON or CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) return;

    importMuds.mutate(selectedFile, {
      onSuccess: (data) => {
        setImportResult(data as ImportResult);
        if ((data as ImportResult).successCount > 0) {
          toast.success(`Successfully imported ${(data as ImportResult).successCount} MUDs`);
        }
        if ((data as ImportResult).errorCount > 0) {
          toast.error(`Failed to import ${(data as ImportResult).errorCount} MUDs`);
        }
      },
      onError: (error) => {
        toast.error((error as Error).message || 'Failed to import file');
      },
    });
  };

  const handleCreateMud = () => {
    createMud.mutate(
      {
        name: formData.name,
        description: formData.fullDescription || formData.shortDescription,
        host: formData.host,
        port: parseInt(formData.port, 10),
        websiteUrl: formData.websiteUrl || undefined,
        codebase: formData.codebaseId || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`${formData.name} created successfully`);
          setIsCreateDialogOpen(false);
          setFormData({
            name: '',
            shortDescription: '',
            fullDescription: '',
            host: '',
            port: '',
            websiteUrl: '',
            codebaseId: '',
            genreId: '',
          });
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to create MUD');
        },
      }
    );
  };

  const downloadTemplate = (format: 'json' | 'csv') => {
    const jsonTemplate = [
      {
        name: 'Example MUD',
        shortDescription: 'A short description of the MUD',
        fullDescription: 'A longer description with more details...',
        host: 'mud.example.com',
        port: 4000,
        websiteUrl: 'https://example.com',
        codebase: 'DikuMUD',
        genre: 'Fantasy',
      },
    ];

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mud-import-template.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csvHeaders = Object.keys(jsonTemplate[0]).join(',');
      const csvRow = Object.values(jsonTemplate[0]).join(',');
      const csv = `${csvHeaders}\n${csvRow}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mud-import-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${format.toUpperCase()} template downloaded`);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Upload className="h-8 w-8 text-primary" />
              Import MUDs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Bulk import MUDs from a file or create them manually
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create MUD
          </Button>
        </div>

        {/* Import Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Bulk Import</CardTitle>
            <CardDescription>
              Upload a JSON or CSV file to import multiple MUDs at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground',
                selectedFile && 'border-green-500 bg-green-500/5'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  {selectedFile.name.endsWith('.json') ? (
                    <FileJson className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      setImportResult(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JSON and CSV formats
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>

            {/* Import Result */}
            {importResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {importResult.successCount > 0 && (
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {importResult.successCount} imported
                    </Badge>
                  )}
                  {importResult.errorCount > 0 && (
                    <Badge variant="outline" className="text-red-500 border-red-500/50">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {importResult.errorCount} failed
                    </Badge>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                    <p className="font-medium text-red-500 mb-2">Errors:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Download template:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('json')}
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              </div>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importMuds.isPending}
              >
                {importMuds.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import MUDs
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Tips */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Import Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Required fields: name, host, port
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Optional fields: shortDescription, fullDescription, websiteUrl, codebase, genre
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Codebase and genre values should match existing options in the system
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Duplicate MUDs (same name or host:port) will be skipped
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Create MUD Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New MUD</DialogTitle>
              <DialogDescription>
                Add a new MUD listing to the directory
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter MUD name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="mud.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="4000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description *</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  placeholder="Brief description (max 200 chars)"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, fullDescription: e.target.value })
                  }
                  placeholder="Detailed description of the MUD..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codebase">Codebase</Label>
                  <Input
                    id="codebase"
                    value={formData.codebaseId}
                    onChange={(e) => setFormData({ ...formData, codebaseId: e.target.value })}
                    placeholder="e.g., DikuMUD, CircleMUD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Select
                    value={formData.genreId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, genreId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres?.map((genre: Genre) => (
                        <SelectItem key={genre.id} value={genre.id}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMud}
                disabled={
                  !formData.name ||
                  !formData.host ||
                  !formData.port ||
                  createMud.isPending
                }
              >
                {createMud.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create MUD'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
