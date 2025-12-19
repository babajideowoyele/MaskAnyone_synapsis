import React, { useCallback, useState } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { colors, spacing, typography, transitions } from '../../styles/tokens';
import { IconBox } from './IconBox';
import { Button } from './Button';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  selectedFile?: File | null;
  onClear?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * FileDropZone - Drag and drop file upload component
 * Supports drag-over states and file preview
 */
export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  accept = 'video/*',
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  selectedFile,
  onClear,
  sx = {},
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <Box
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        border: selectedFile
          ? `3px solid ${colors.black}`
          : `3px dashed ${isDragOver ? colors.black : colors.gray[300]}`,
        padding: `${spacing.xxxl}px ${spacing.xxl}px`,
        textAlign: 'center',
        cursor: 'pointer',
        transition: `all ${transitions.normal}`,
        backgroundColor: isDragOver
          ? colors.gray[100]
          : selectedFile
          ? colors.white
          : colors.gray[50],
        '&:hover': {
          borderColor: colors.black,
          backgroundColor: selectedFile ? colors.white : colors.gray[100],
        },
        ...sx,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {selectedFile ? (
        // File selected state
        <Box>
          <IconBox size="xxl" variant="success" sx={{ margin: '0 auto', mb: `${spacing.xl}px` }}>
            <i className="fas fa-check" />
          </IconBox>
          <Typography
            variant="h6"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              mb: `${spacing.sm}px`,
            }}
          >
            {selectedFile.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.text.secondary, mb: `${spacing.base}px` }}
          >
            {formatFileSize(selectedFile.size)}
          </Typography>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <i className="fas fa-times" /> Remove
          </Button>
        </Box>
      ) : (
        // Empty state
        <Box>
          <IconBox size="xxl" variant="filled" sx={{ margin: '0 auto', mb: `${spacing.xl}px` }}>
            <i className="fas fa-cloud-upload-alt" />
          </IconBox>
          <Typography
            variant="h6"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              mb: `${spacing.sm}px`,
            }}
          >
            Drag and drop your video here
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.text.secondary, mb: `${spacing.xl}px` }}
          >
            or click to browse files
          </Typography>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <i className="fas fa-folder-open" /> Browse Files
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileDropZone;
