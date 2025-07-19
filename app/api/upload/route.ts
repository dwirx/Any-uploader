import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, BMP, WEBP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (128MB = 134217728 bytes)
    if (file.size > 134217728) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 128MB.' },
        { status: 400 }
      );
    }

    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create form data for Freeimage.host API with optimal settings
    const uploadFormData = new FormData();
    uploadFormData.append('key', process.env.FREEIMAGE_API_KEY!);
    uploadFormData.append('action', 'upload');
    uploadFormData.append('source', file);
    uploadFormData.append('format', 'json');
    
    // Ensure original quality and size preservation
    uploadFormData.append('type', 'file');
    uploadFormData.append('privacy', 'public');
    
    // Add additional parameters for better quality
    uploadFormData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Remove extension for name
    uploadFormData.append('description', 'Uploaded via FreeImage Host App');
    
    // Add quality parameters
    uploadFormData.append('quality', '100'); // Maximum quality
    uploadFormData.append('resize', '0'); // No resize, keep original size
    
    // Add proper headers to avoid guest detection
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://freeimage.host/',
      'Origin': 'https://freeimage.host',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    console.log('Sending request to Freeimage.host...');
    console.log('API Key:', process.env.FREEIMAGE_API_KEY);
    console.log('API URL:', process.env.FREEIMAGE_API_URL);

    // Upload to Freeimage.host with proper headers
    const response = await fetch(process.env.FREEIMAGE_API_URL!, {
      method: 'POST',
      body: uploadFormData,
      headers,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload result:', JSON.stringify(result, null, 2));
    
    // Validate response
    if (result.status_code !== 200 || !result.success) {
      console.error('API Error:', result);
      throw new Error(result.status_txt || 'Upload failed');
    }
    
    // Add provider identifier
    const responseWithProvider = {
      ...result,
      provider: 'freeimage'
    };
    
    return NextResponse.json(responseWithProvider);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
} 