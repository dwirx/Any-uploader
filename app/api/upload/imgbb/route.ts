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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/heic', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, BMP, WEBP, TIF, HEIC, AVIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (32MB = 33554432 bytes for ImgBB)
    if (file.size > 33554432) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 32MB for ImgBB.' },
        { status: 400 }
      );
    }

    console.log('Uploading to ImgBB:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create form data for ImgBB API
    const uploadFormData = new FormData();
    uploadFormData.append('key', process.env.IMGBB_API_KEY!);
    uploadFormData.append('image', file);
    uploadFormData.append('name', file.name.replace(/\.[^/.]+$/, '')); // Remove extension for name
    
    // Add proper headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://imgbb.com/',
      'Origin': 'https://imgbb.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
    };

    console.log('Sending request to ImgBB...');
    console.log('API Key:', process.env.IMGBB_API_KEY);
    console.log('API URL:', process.env.IMGBB_API_URL);

    // Upload to ImgBB
    const response = await fetch(process.env.IMGBB_API_URL!, {
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
    if (!result.success || result.status !== 200) {
      console.error('API Error:', result);
      throw new Error('Upload failed');
    }
    
         // Transform ImgBB response to match our interface
     const transformedResult = {
       status_code: result.status,
       success: {
         message: 'Image uploaded successfully',
         code: result.status
       },
       image: {
         url: result.data.url, // Direct image URL
         url_viewer: result.data.url_viewer, // Viewer page URL
         display_url: result.data.display_url, // Display URL
         filename: result.data.image.filename,
         size_formatted: `${Math.round(result.data.size / 1024)} KB`,
         size: parseInt(result.data.size),
         width: parseInt(result.data.width),
         height: parseInt(result.data.height),
         mime: result.data.image.mime,
         bits: 8, // Default for most images
         channels: null,
         ratio: parseInt(result.data.width) / parseInt(result.data.height),
         original_filename: result.data.title,
         thumb: {
           url: result.data.thumb.url, // Thumbnail URL
           width: parseInt(result.data.width),
           height: parseInt(result.data.height),
           size_formatted: `${Math.round(result.data.size / 1024)} KB`
         },
         medium: {
           url: result.data.medium.url, // Medium size URL
           width: parseInt(result.data.width),
           height: parseInt(result.data.height),
           size_formatted: `${Math.round(result.data.size / 1024)} KB`
         }
       },
       status_txt: 'OK',
       provider: 'imgbb'
     };
    
    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
} 