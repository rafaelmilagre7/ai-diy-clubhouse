
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../utils/mockProviders';
import { useFileUpload } from '@/hooks/useFileUpload';

// Mock Supabase Storage
const mockStorageFrom = jest.fn().mockReturnValue({
  upload: jest.fn().mockResolvedValue({
    data: { path: 'test-file.jpg' },
    error: null
  }),
  getPublicUrl: jest.fn().mockReturnValue({
    data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/test-bucket/test-file.jpg' }
  }),
  listBuckets: jest.fn().mockResolvedValue({
    data: [{ name: 'test-bucket' }],
    error: null
  }),
  createBucket: jest.fn().mockResolvedValue({
    data: null,
    error: null
  })
});

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: mockStorageFrom,
      listBuckets: mockStorageFrom().listBuckets,
      createBucket: mockStorageFrom().createBucket
    }
  }
}));

// Test component using useFileUpload
const TestUploadComponent = ({ bucketName = 'test-bucket', maxSize = 5 }) => {
  const { uploading, uploadedFileUrl, handleFileUpload, error } = useFileUpload({
    bucketName,
    onUploadComplete: jest.fn(),
    maxSize
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        data-testid="file-input"
      />
      {uploading && <div>Uploading...</div>}
      {uploadedFileUrl && <div>Upload successful: {uploadedFileUrl}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

describe('Storage Upload Tester - Fase 2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Upload Tests', () => {
    test('Should upload image files successfully', async () => {
      render(
        <TestWrapper>
          <TestUploadComponent bucketName="images" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [imageFile] } });

      expect(screen.getByText('Uploading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockStorageFrom).toHaveBeenCalledWith('images');
        expect(screen.getByText(/Upload successful/)).toBeInTheDocument();
      });
    });

    test('Should handle large image files (>5MB)', async () => {
      render(
        <TestWrapper>
          <TestUploadComponent bucketName="images" maxSize={5} />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      // Create a large file (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Error.*excede.*5MB/)).toBeInTheDocument();
      });
    });

    test('Should validate image file types', async () => {
      render(
        <TestWrapper>
          <TestUploadComponent bucketName="images" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      for (const type of validTypes) {
        const file = new File(['content'], `test.${type.split('/')[1]}`, { type });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(mockStorageFrom).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Video Upload Tests', () => {
    test('Should upload video files with progress tracking', async () => {
      render(
        <TestWrapper>
          <TestUploadComponent bucketName="videos" maxSize={200} />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });

      fireEvent.change(fileInput, { target: { files: [videoFile] } });

      expect(screen.getByText('Uploading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Upload successful/)).toBeInTheDocument();
      });
    });

    test('Should handle video upload failures', async () => {
      mockStorageFrom.mockReturnValueOnce({
        upload: jest.fn().mockRejectedValue(new Error('Network error')),
        getPublicUrl: jest.fn()
      });

      render(
        <TestWrapper>
          <TestUploadComponent bucketName="videos" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });

      fireEvent.change(fileInput, { target: { files: [videoFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Error.*Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('PDF Upload Tests', () => {
    test('Should upload PDF documents', async () => {
      render(
        <TestWrapper>
          <TestUploadComponent bucketName="documents" maxSize={25} />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const pdfFile = new File(['PDF content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      await waitFor(() => {
        expect(mockStorageFrom).toHaveBeenCalledWith('documents');
        expect(screen.getByText(/Upload successful/)).toBeInTheDocument();
      });
    });

    test('Should handle concurrent uploads', async () => {
      const { rerender } = render(
        <TestWrapper>
          <TestUploadComponent bucketName="documents" />
        </TestWrapper>
      );

      // Simulate multiple file uploads
      const files = [
        new File(['content1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['content2'], 'test2.pdf', { type: 'application/pdf' }),
        new File(['content3'], 'test3.pdf', { type: 'application/pdf' })
      ];

      files.forEach((file, index) => {
        rerender(
          <TestWrapper key={index}>
            <TestUploadComponent bucketName="documents" />
          </TestWrapper>
        );

        const fileInput = screen.getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockStorageFrom).toHaveBeenCalledTimes(files.length);
      });
    });
  });

  describe('Storage Performance Tests', () => {
    test('Should complete upload within acceptable time limits', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <TestUploadComponent bucketName="test" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Upload successful/)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const uploadTime = endTime - startTime;

      // Should complete in less than 1 second for mock uploads
      expect(uploadTime).toBeLessThan(1000);
    });

    test('Should handle bucket creation efficiently', async () => {
      mockStorageFrom().listBuckets.mockResolvedValueOnce({
        data: [],
        error: null
      });

      render(
        <TestWrapper>
          <TestUploadComponent bucketName="new-bucket" />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(mockStorageFrom().createBucket).toHaveBeenCalledWith('new-bucket', expect.any(Object));
      });
    });
  });
});
