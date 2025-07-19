# Multi-Image Host

A modern web application for uploading and sharing images and files using multiple providers (Freeimage.host, ImgBB, and Gofile). Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🖼️ **Drag & Drop Upload**: Easy image upload with drag and drop interface
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- 🔗 **Instant Sharing**: Get direct links to uploaded images
- 📋 **Copy to Clipboard**: One-click URL copying
- 🖼️ **Multiple Formats**: Supports JPG, PNG, GIF, BMP, WEBP, TIF, HEIC, AVIF
- 📊 **Image Details**: Shows file size, dimensions, and thumbnails
- 🚀 **Fast Upload**: Optimized for quick image processing
- 🔄 **Multi-Provider**: Support for Freeimage.host, ImgBB, and Gofile
- 🎯 **Provider Selection**: Choose your preferred hosting service
- 📁 **Universal File Support**: Upload any file type with Gofile

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: React Dropzone
- **HTTP Client**: Axios
- **API**: Freeimage.host, ImgBB & Gofile

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd freeimage-host
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your API keys to `.env.local`:
```env
FREEIMAGE_API_KEY=your_freeimage_api_key_here
FREEIMAGE_API_URL=https://freeimage.host/api/1/upload

# ImgBB API Configuration
IMGBB_API_KEY=your_imgbb_api_key_here
IMGBB_API_URL=https://api.imgbb.com/1/upload

# Gofile API Configuration
GOFILE_API_TOKEN=your_gofile_api_token_here
GOFILE_UPLOAD_URL=https://upload.gofile.io/uploadfile
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Images**: Drag and drop images onto the upload area or click to select files
2. **View Results**: See uploaded images with thumbnails and details
3. **Copy URLs**: Click "Copy URL" to copy the direct image link
4. **View Images**: Click "View Image" to open the full image in a new tab
5. **Clear All**: Use "Clear All" to remove all uploaded images from the list

## API Integration

This application uses multiple APIs for file hosting:

### Freeimage.host API v1
- **Upload Endpoint**: `POST /api/1/upload`
- **Supported Formats**: JPG, PNG, GIF, BMP, WEBP
- **File Size Limit**: 128MB per image
- **Response Format**: JSON with image details and URLs

### ImgBB API
- **Upload Endpoint**: `POST /api/upload/imgbb`
- **Supported Formats**: JPG, PNG, GIF, BMP, WEBP, TIF, HEIC, AVIF
- **File Size Limit**: 32MB per image
- **Response Format**: JSON with direct image URLs and viewer pages

### Gofile API
- **Upload Endpoint**: `POST /api/upload/gofile`
- **Supported Formats**: ALL file types (images, documents, videos, archives, etc.)
- **File Size Limit**: Unlimited
- **Response Format**: JSON with download pages and direct links

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FREEIMAGE_API_KEY` | Your Freeimage.host API key | Yes |
| `FREEIMAGE_API_URL` | Freeimage.host API endpoint | Yes |
| `IMGBB_API_KEY` | Your ImgBB API key | Optional |
| `IMGBB_API_URL` | ImgBB API endpoint | Optional |
| `GOFILE_API_TOKEN` | Your Gofile API token | Optional |
| `GOFILE_UPLOAD_URL` | Gofile upload endpoint | Optional |

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/route.ts           # Freeimage.host upload API
│   │   ├── upload/imgbb/route.ts     # ImgBB upload API
│   │   └── upload/gofile/route.ts    # Gofile upload API
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main upload page
├── public/                           # Static assets
├── .env.local                       # Environment variables
└── package.json                     # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Freeimage.host](https://freeimage.host) for providing the image hosting API
- [ImgBB](https://imgbb.com) for providing the image hosting API
- [Gofile](https://gofile.io) for providing the universal file hosting API
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide React](https://lucide.dev) for icons
