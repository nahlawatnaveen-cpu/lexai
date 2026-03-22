'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DOCUMENT_TEMPLATES } from '@/lib/documents/templates';
import { generatePDFContent } from '@/lib/documents/generator';
import { FileText, Download, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { saveDocument } from '@/actions/documents';

export function DocumentCreator({ userId }: { userId: string }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const template = DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setGeneratedContent(null);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    if (!template) return;

    const requiredFields = template.fields.filter((f) => f.required);
    const missingFields = requiredFields.filter((f) => !formData[f.name]?.trim());

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const content = generatePDFContent({
        title: template.name,
        type: template.id.toUpperCase(),
        date: new Date().toISOString(),
        content: formData,
      });

      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success('Document generated successfully!');
    }, 1500);
  };

  const handleSave = async () => {
    if (!generatedContent || !template) return;

    setIsSaving(true);
    try {
      await saveDocument({
        title: `${template.name} - ${new Date().toLocaleDateString('en-IN')}`,
        type: template.name,
        content: generatedContent,
      });
      toast.success('Document saved successfully!');
      router.push('/documents');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;

    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  const categories = [...new Set(DOCUMENT_TEMPLATES.map((t) => t.category))];

  return (
    <div className="container px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Document</h1>
          <p className="text-muted-foreground">
            Select a template and generate professional legal documents
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor" disabled={!template}>
            Fill Details
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {DOCUMENT_TEMPLATES.filter((t) => t.category === category).map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === t.id
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(t.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <CardDescription>{t.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="editor">
          {template && (
            <Card>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {template.fields.map((field) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const extField = field as any;
                    return (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-destructive"> *</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={extField.placeholder || ''}
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={extField.placeholder || ''}
                        />
                      )}
                  </div>
                );
              })}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Document
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {generatedContent && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Document Preview</CardTitle>
                    <CardDescription>
                      Review your generated document before saving
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Save Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-6 rounded-lg font-mono text-sm whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
