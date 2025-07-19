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

    // Gofile supports all file types, no validation needed
    console.log('Uploading to Gofile:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Create form data for Gofile API
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    // Add proper headers for Gofile API
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://gofile.io/',
      'Origin': 'https://gofile.io',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
    };

    console.log('Sending request to Gofile...');
    console.log('API Token:', process.env.GOFILE_API_TOKEN);
    console.log('Upload URL:', process.env.GOFILE_UPLOAD_URL);

    // Upload to Gofile
    const response = await fetch(process.env.GOFILE_UPLOAD_URL!, {
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
    if (result.status !== 'ok') {
      console.error('API Error:', result);
      throw new Error(result.status || 'Upload failed');
    }
    
    // Transform Gofile response to match our interface
    const transformedResult = {
      status_code: 200,
      success: {
        message: 'File uploaded successfully',
        code: 200
      },
      image: {
        url: result.data.downloadPage,
        url_viewer: result.data.downloadPage,
        display_url: result.data.downloadPage,
        filename: file.name,
        size_formatted: `${Math.round(file.size / 1024)} KB`,
        size: file.size,
        width: null, // Gofile doesn't provide image dimensions
        height: null,
        mime: file.type,
        bits: null,
        channels: null,
        ratio: null,
        original_filename: file.name,
        thumb: {
          url: result.data.downloadPage,
          width: null,
          height: null,
          size_formatted: `${Math.round(file.size / 1024)} KB`
        },
        medium: {
          url: result.data.downloadPage,
          width: null,
          height: null,
          size_formatted: `${Math.round(file.size / 1024)} KB`
        }
      },
      status_txt: 'OK',
      provider: 'gofile',
      gofile_data: {
        fileId: result.data.fileId,
        fileName: result.data.fileName,
        downloadPage: result.data.downloadPage,
        directLink: result.data.directLink,
        folderId: result.data.folderId,
        accountId: result.data.accountId
      }
    };
    
    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
} 