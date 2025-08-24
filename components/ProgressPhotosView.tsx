import React, { useState, useRef } from 'react';
import { ProgressPhoto } from '../types';
import { CameraIcon, PlusIcon, TrashIcon } from './icons';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ProgressPhotosViewProps {
  photos: ProgressPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<ProgressPhoto[]>>;
}

const ProgressPhotosView: React.FC<ProgressPhotosViewProps> = ({ photos, setPhotos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!uploadDate) {
        alert("Please select a date first before uploading photos.");
        return;
    }

    const oversizedFiles: string[] = [];

    Array.from(files).forEach(file => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            oversizedFiles.push(file.name);
            return; // Skip this file
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const newPhoto: ProgressPhoto = {
            id: crypto.randomUUID(),
            date: uploadDate,
            imageDataUrl: loadEvent.target?.result as string,
            mimeType: file.type,
          };
          setPhotos(prev => [...prev, newPhoto].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        };
        reader.readAsDataURL(file);
    });

    if (oversizedFiles.length > 0) {
        alert(`The following files are too large (max ${MAX_FILE_SIZE_MB}MB) and were not uploaded:\n\n${oversizedFiles.join('\n')}`);
    }
    
    event.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
        setPhotos(prev => prev.filter(p => p.id !== id));
    }
  }

  // Group photos by date
  const photosByDate = photos.reduce((acc, photo) => {
    (acc[photo.date] = acc[photo.date] || []).push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());


  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg border border-border animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-primary"/>
            Progress Photos
        </h2>
        <div className="flex items-center gap-2">
            <input 
                type="date" 
                value={uploadDate} 
                onChange={e => setUploadDate(e.target.value)}
                className="bg-accent border border-border rounded-md px-3 py-2 text-text text-sm focus:ring-primary focus:border-primary"
            />
            <button
              onClick={() => {
                  if (!uploadDate) {
                    alert("Please select a date first.");
                    return;
                  }
                  fileInputRef.current?.click()
              }}
              disabled={!uploadDate}
              className="flex items-center gap-2 bg-primary text-background dark:text-secondary font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Add Media</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
              multiple
            />
        </div>
      </div>

      {sortedDates.length > 0 ? (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-text mb-2 border-b border-border pb-1">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photosByDate[date].map(photo => (
                  <div key={photo.id} className="relative group aspect-w-1 aspect-h-1 bg-background rounded-lg overflow-hidden border border-border">
                    {photo.mimeType && photo.mimeType.startsWith('video/') ? (
                      <video 
                        src={photo.imageDataUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        title={`Progress on ${photo.date}`}
                      />
                    ) : (
                      <img src={photo.imageDataUrl} alt={`Progress on ${photo.date}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button onClick={() => handleDelete(photo.id)} className="absolute top-2 right-2 p-1.5 bg-red-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <CameraIcon className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No photos yet.</h3>
          <p>Upload your first progress picture to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressPhotosView;