"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";

export interface FileUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
}

export function FileUpload({
  maxFiles = 5,
  maxSizeInMB = 10,
  value = [],
  onChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>(value);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      
      // Проверка количества файлов
      if (files.length + selectedFiles.length > maxFiles) {
        toast.error(`Максимальное количество файлов: ${maxFiles}`);
        return;
      }

      // Проверка размера файлов
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > maxSizeInMB * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        toast.error(`Максимальный размер файла: ${maxSizeInMB}MB`);
        return;
      }

      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      onChange?.(newFiles);
    },
    [files, maxFiles, maxSizeInMB, onChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onChange?.(newFiles);
    },
    [files, onChange]
  );

  return (
    <div className="space-y-4">
      <Input
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx"
        className="cursor-pointer"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file, index) => (
          <Card key={index} className="p-3 relative">
            <div className="flex items-center justify-between">
              <div className="truncate flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {files.length > 0 && (
        <p className="text-sm text-gray-500">
          Загружено файлов: {files.length} из {maxFiles}
        </p>
      )}
    </div>
  );
} 