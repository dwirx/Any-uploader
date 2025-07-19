'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface UploadedImage {
  url: string;
  url_viewer: string;
  display_url: string;
  filename: string;
  size_formatted: string;
  size: number;
  width: number | null;
  height: number | null;
  mime: string;
  bits: number | null;
  channels: number | null;
  ratio: number | null;
  original_filename: string;
  thumb: {
    url: string;
    width: number | null;
    height: number | null;
    size_formatted: string;
  };
  medium: {
    url: string;
    width: number | null;
    height: number | null;
    size_formatted: string;
  };
  provider: 'freeimage' | 'imgbb' | 'gofile';
  gofile_data?: {
    fileId: string;
    fileName: string;
    downloadPage: string;
    directLink: string;
    folderId: string;
    accountId: string;
  };
}

interface UploadResponse {
  status_code: number;
  success: {
    message: string;
    code: number;
  };
  image: UploadedImage;
  status_txt: string;
  provider?: 'freeimage' | 'imgbb' | 'gofile';
}

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showFullUrl, setShowFullUrl] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'freeimage' | 'imgbb' | 'gofile'>('freeimage');
  const [filterProvider, setFilterProvider] = useState<'all' | 'freeimage' | 'imgbb' | 'gofile'>('all');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress({});

    try {
      const results: UploadResponse['image'][] = [];
      
      for (const file of acceptedFiles) {
        const fileName = file.name;
        setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
        
        const formData = new FormData();
        formData.append('file', file);

        // Choose API endpoint based on selected provider
        const apiEndpoint = selectedProvider === 'imgbb' ? '/api/upload/imgbb' : 
                           selectedProvider === 'gofile' ? '/api/upload/gofile' : '/api/upload';

        const response = await axios.post<UploadResponse>(apiEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [fileName]: progress }));
            }
          },
        });

        // Add provider information to the image data
        const imageWithProvider = {
          ...response.data.image,
          provider: selectedProvider
        };
        
        results.push(imageWithProvider);
        setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
      }

      setUploadedImages(prev => [...prev, ...results]);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to upload image. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [selectedProvider]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleFullUrl = (url: string) => {
    if (showFullUrl === url) {
      setShowFullUrl(null);
    } else {
      setShowFullUrl(url);
    }
  };

  const clearAll = () => {
    setUploadedImages([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
                 {/* Header */}
         <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-gray-800 mb-2">
             Multi-Image Host
           </h1>
           <p className="text-gray-600 mb-4">
             Upload and share your images instantly using multiple providers
           </p>
           
           {/* Provider Selection */}
           <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto mb-4">
             <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Upload Provider:</h3>
             <div className="grid grid-cols-3 gap-2">
               <button
                 onClick={() => setSelectedProvider('freeimage')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                   selectedProvider === 'freeimage'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 FreeImage.host
               </button>
               <button
                 onClick={() => setSelectedProvider('imgbb')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                   selectedProvider === 'imgbb'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 ImgBB
               </button>
               <button
                 onClick={() => setSelectedProvider('gofile')}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                   selectedProvider === 'gofile'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 Gofile
               </button>
             </div>
             <div className="mt-2 text-xs text-gray-500">
               {selectedProvider === 'freeimage' 
                 ? 'Supports: JPG, PNG, GIF, BMP, WEBP (max 128MB)'
                 : selectedProvider === 'imgbb'
                 ? 'Supports: JPG, PNG, GIF, BMP, WEBP, TIF, HEIC, AVIF (max 32MB)'
                 : 'Supports: ALL file types (unlimited size)'
               }
             </div>
           </div>
           
           <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto">
             <div className="flex items-center justify-center space-x-2 text-green-700">
               <Check className="w-4 h-4" />
               <span className="text-sm font-medium">Premium Upload - Original Quality Preserved</span>
             </div>
             <p className="text-xs text-green-600 mt-1">
               All images uploaded with maximum quality and full resolution
             </p>
           </div>
         </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
                     <div className="flex flex-col items-center space-y-4">
             {isUploading ? (
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
             ) : (
               <Upload className="w-12 h-12 text-gray-400" />
             )}
             <div>
               <p className="text-lg font-medium text-gray-700">
                 {isDragActive
                   ? 'Drop the files here...'
                   : isUploading
                   ? `Uploading to ${selectedProvider === 'imgbb' ? 'ImgBB' : 'FreeImage.host'}...`
                   : 'Drag & drop images here, or click to select'}
               </p>
               <p className="text-sm text-gray-500 mt-1">
                 {selectedProvider === 'freeimage' 
                   ? 'Supports: JPG, PNG, GIF, BMP, WEBP (max 128MB) - Original quality preserved'
                   : selectedProvider === 'imgbb'
                   ? 'Supports: JPG, PNG, GIF, BMP, WEBP, TIF, HEIC, AVIF (max 32MB) - Original quality preserved'
                   : 'Supports: ALL file types (unlimited size) - Universal file hosting'
                 }
               </p>
             </div>
             
             {/* Upload Progress */}
             {isUploading && Object.keys(uploadProgress).length > 0 && (
               <div className="w-full max-w-md space-y-2">
                 {Object.entries(uploadProgress).map(([fileName, progress]) => (
                   <div key={fileName} className="bg-white rounded-lg p-3 border">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700 truncate">
                         {fileName}
                       </span>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                           {selectedProvider === 'imgbb' ? 'ImgBB' : 
                            selectedProvider === 'gofile' ? 'Gofile' : 'FreeImage'}
                         </span>
                         <span className="text-sm text-gray-500">{progress}%</span>
                       </div>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div
                         className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                         style={{ width: `${progress}%` }}
                       />
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

                 {/* Uploaded Images */}
         {uploadedImages.length > 0 && (
           <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-semibold text-gray-800">
                 Uploaded Images ({uploadedImages.length})
               </h2>
               <div className="flex items-center space-x-4">
                 {/* Filter by Provider */}
                 <div className="flex items-center space-x-2">
                   <span className="text-sm text-gray-600">Filter:</span>
                   <select
                     value={filterProvider}
                     onChange={(e) => setFilterProvider(e.target.value as 'all' | 'freeimage' | 'imgbb' | 'gofile')}
                     className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="all">All Providers</option>
                     <option value="freeimage">FreeImage.host</option>
                     <option value="imgbb">ImgBB</option>
                     <option value="gofile">Gofile</option>
                   </select>
                 </div>
                 <button
                   onClick={clearAll}
                   className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                 >
                   Clear All
                 </button>
               </div>
             </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {uploadedImages
                 .filter(image => filterProvider === 'all' || image.provider === filterProvider)
                 .map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                                     <div className="relative">
                     <img
                       src={image.thumb?.url || image.url}
                       alt={image.original_filename || image.filename || 'Uploaded image'}
                       className="w-full h-48 object-cover"
                       onError={(e) => {
                         // Fallback to original URL if thumbnail fails
                         const target = e.target as HTMLImageElement;
                         if (target.src !== image.url) {
                           target.src = image.url;
                         }
                       }}
                     />
                     <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                       {image.size_formatted || 'Unknown'}
                     </div>
                     <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                       {image.provider === 'imgbb' ? 'ImgBB' : 
                        image.provider === 'gofile' ? 'Gofile' : 'FreeImage'}
                     </div>
                   </div>
                  
                                     <div className="p-4">
                     <h3 className="font-medium text-gray-800 truncate mb-2">
                       {image.original_filename || image.filename || 'Uploaded Image'}
                     </h3>
                     
                     {/* Image Quality Info */}
                     <div className="mb-3 space-y-1">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Dimensions:</span>
                         <span className="text-gray-700 font-medium">
                           {image.width || 'Unknown'} × {image.height || 'Unknown'}
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">File Size:</span>
                         <span className="text-gray-700 font-medium">{image.size_formatted || 'Unknown'}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Format:</span>
                         <span className="text-gray-700 font-medium">{image.mime ? image.mime.toUpperCase() : 'Unknown'}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Quality:</span>
                         <span className="text-green-600 font-medium">
                           {image.bits || 'Unknown'} bit{image.channels ? ` (${image.channels} channels)` : ''}
                         </span>
                       </div>
                     </div>
                     
                                          <div className="space-y-2">
                       <button
                         onClick={() => copyToClipboard(image.url)}
                         className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                       >
                         {copiedUrl === image.url ? (
                           <Check className="w-4 h-4" />
                         ) : (
                           <Copy className="w-4 h-4" />
                         )}
                         <span>
                           {copiedUrl === image.url ? 'Copied!' : 'Copy Direct URL'}
                         </span>
                       </button>
                       
                       <div className="grid grid-cols-2 gap-2">
                         {image.medium && image.medium.url !== image.url && (
                           <a
                             href={image.medium.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-center px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                           >
                             Medium ({image.medium.width || '?'}×{image.medium.height || '?'})
                           </a>
                         )}
                         <a
                           href={image.url_viewer}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-center px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                           title={image.provider === 'imgbb' ? 'Opens ImgBB viewer page with sharing options' : 
                                 image.provider === 'gofile' ? 'Opens Gofile download page' : 'Opens image viewer page'}
                         >
                           {image.provider === 'imgbb' ? '🌐 ImgBB Page' : 
                            image.provider === 'gofile' ? '📥 Download Page' : 'Viewer'}
                         </a>
                       </div>
                       
                       {/* Additional Direct Image button for ImgBB */}
                       {image.provider === 'imgbb' && (
                         <div className="mt-2">
                           <a
                             href={image.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="block w-full text-center px-3 py-2 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors"
                             title="Opens the image directly in browser (e.g., https://i.ibb.co/S73Gs1GG/ngerti-banget.jpg)"
                           >
                             🖼️ Direct Image URL
                           </a>
                           <p className="text-xs text-gray-500 mt-1 text-center">
                             Opens image directly in browser
                           </p>
                         </div>
                       )}
                       
                       {/* Additional Direct Link button for Gofile */}
                       {image.provider === 'gofile' && image.gofile_data?.directLink && (
                         <div className="mt-2">
                           <a
                             href={image.gofile_data.directLink}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="block w-full text-center px-3 py-2 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors"
                             title="Direct download link for the file"
                           >
                             🔗 Direct Download Link
                           </a>
                           <p className="text-xs text-gray-500 mt-1 text-center">
                             Direct file download link
                           </p>
                         </div>
                       )}
                       
                       {/* Additional info for ImgBB */}
                       {image.provider === 'imgbb' && (
                         <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                           <div className="font-medium mb-1">ImgBB URLs:</div>
                           <div className="space-y-1">
                             <div className="flex justify-between items-center">
                               <span>🖼️ Direct Image:</span>
                               <button
                                 onClick={() => toggleFullUrl(image.url)}
                                 className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                               >
                                 {showFullUrl === image.url ? 'Hide' : 'Show'} Full URL
                               </button>
                             </div>
                             {showFullUrl === image.url && (
                               <div className="bg-white p-2 rounded border text-xs break-all relative">
                                 <div className="pr-8">{image.url}</div>
                                 <button
                                   onClick={() => copyToClipboard(image.url)}
                                   className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
                                   title="Copy URL"
                                 >
                                   <Copy className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                             <div className="flex justify-between items-center">
                               <span>📱 Display (Mobile):</span>
                               <button
                                 onClick={() => toggleFullUrl(image.display_url)}
                                 className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                               >
                                 {showFullUrl === image.display_url ? 'Hide' : 'Show'} Full URL
                               </button>
                             </div>
                             {showFullUrl === image.display_url && (
                               <div className="bg-white p-2 rounded border text-xs break-all relative">
                                 <div className="pr-8">{image.display_url}</div>
                                 <button
                                   onClick={() => copyToClipboard(image.display_url)}
                                   className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
                                   title="Copy URL"
                                 >
                                   <Copy className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                             <div className="flex justify-between items-center">
                               <span>🌐 ImgBB Page:</span>
                               <button
                                 onClick={() => toggleFullUrl(image.url_viewer)}
                                 className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                               >
                                 {showFullUrl === image.url_viewer ? 'Hide' : 'Show'} Full URL
                               </button>
                             </div>
                             {showFullUrl === image.url_viewer && (
                               <div className="bg-white p-2 rounded border text-xs break-all relative">
                                 <div className="pr-8">{image.url_viewer}</div>
                                 <button
                                   onClick={() => copyToClipboard(image.url_viewer)}
                                   className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
                                   title="Copy URL"
                                 >
                                   <Copy className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                           </div>
                                                  </div>
                       )}
                     </div>
                   </div>
                   
                   {/* Additional info for Gofile */}
                   {image.provider === 'gofile' && image.gofile_data && (
                     <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                       <div className="font-medium mb-1">Gofile Information:</div>
                       <div className="space-y-1">
                         <div className="flex justify-between items-center">
                           <span>📁 File ID:</span>
                           <span className="font-mono text-xs">{image.gofile_data.fileId}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span>📂 Folder ID:</span>
                           <span className="font-mono text-xs">{image.gofile_data.folderId}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span>🌐 Download Page:</span>
                           <button
                             onClick={() => toggleFullUrl(image.gofile_data!.downloadPage)}
                             className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                           >
                             {showFullUrl === image.gofile_data!.downloadPage ? 'Hide' : 'Show'} URL
                           </button>
                         </div>
                         {showFullUrl === image.gofile_data!.downloadPage && (
                           <div className="bg-white p-2 rounded border text-xs break-all relative">
                             <div className="pr-8">{image.gofile_data!.downloadPage}</div>
                             <button
                               onClick={() => copyToClipboard(image.gofile_data!.downloadPage)}
                               className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
                               title="Copy URL"
                             >
                               <Copy className="w-3 h-3" />
                             </button>
                           </div>
                         )}
                         {image.gofile_data!.directLink && (
                           <>
                             <div className="flex justify-between items-center">
                               <span>🔗 Direct Link:</span>
                               <button
                                 onClick={() => toggleFullUrl(image.gofile_data!.directLink)}
                                 className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                               >
                                 {showFullUrl === image.gofile_data!.directLink ? 'Hide' : 'Show'} URL
                               </button>
                             </div>
                             {showFullUrl === image.gofile_data!.directLink && (
                               <div className="bg-white p-2 rounded border text-xs break-all relative">
                                 <div className="pr-8">{image.gofile_data!.directLink}</div>
                                 <button
                                   onClick={() => copyToClipboard(image.gofile_data!.directLink)}
                                   className="absolute top-1 right-1 text-blue-600 hover:text-blue-800"
                                   title="Copy URL"
                                 >
                                   <Copy className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                           </>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>
                 )}
         
         {/* Quality Information */}
         {uploadedImages.length > 0 && (
           <div className="mt-8 bg-white rounded-lg shadow-md p-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">
               Upload Quality Information
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
               <div className="bg-blue-50 p-3 rounded-lg">
                 <div className="font-medium text-blue-800 mb-1">Original Quality</div>
                 <div className="text-blue-600">All images uploaded with full resolution and original quality preserved</div>
               </div>
               <div className="bg-green-50 p-3 rounded-lg">
                 <div className="font-medium text-green-800 mb-1">Multiple Formats</div>
                 <div className="text-green-600">Automatic generation of thumbnail and medium versions for different use cases</div>
               </div>
               <div className="bg-purple-50 p-3 rounded-lg">
                 <div className="font-medium text-purple-800 mb-1">Direct Links</div>
                 <div className="text-purple-600">Get direct URLs for original, medium, and thumbnail versions</div>
               </div>
               <div className="bg-orange-50 p-3 rounded-lg">
                 <div className="font-medium text-orange-800 mb-1">Multi-Provider</div>
                 <div className="text-orange-600">Support for FreeImage.host and ImgBB with automatic provider selection</div>
               </div>
               <div className="bg-yellow-50 p-3 rounded-lg">
                 <div className="font-medium text-yellow-800 mb-1">ImgBB URLs</div>
                 <div className="text-yellow-600">Direct image URLs (e.g., https://i.ibb.co/S73Gs1GG/ngerti-banget.jpg) for easy sharing</div>
               </div>
               
               <div className="bg-purple-50 p-3 rounded-lg">
                 <div className="font-medium text-purple-800 mb-1">Gofile Universal Hosting</div>
                 <div className="text-purple-600">Supports ALL file types (images, documents, videos, archives) with unlimited size</div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }
