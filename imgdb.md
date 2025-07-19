ImgBB
API version 1
Imgbb's API v1 allows to upload pictures.

586a4058314c893b825e2f477b8696ae


Request method
API v1 calls can be done using the POST or GET request methods but since GET request are limited by the maximum allowed length of an URL you should prefer the POST request method.

Image Upload
https://api.imgbb.com/1/upload

Parameters
key (required)
The API key.
image (required)
A binary file, base64 data, or a URL for an image. (up to 32 MB)
name (optional)
The name of the file, this is automatically detected if uploading a file with a POST and multipart / form-data
expiration (optional)
Enable this if you want to force uploads to be auto deleted after certain time (in seconds 60-15552000)
Example call
curl --location --request POST "https://api.imgbb.com/1/upload?expiration=600&key=YOUR_CLIENT_API_KEY" --form "image=R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

Note: Always use POST when uploading local files. Url encoding may alter the base64 source due to encoded characters or just by URL request length limit due to GET request.

API response
API v1 responses display all the image uploaded information in JSON format.

JSON the response will have headers status codes to allow you to easily notice if the request was OK or not. It will also output the status properties.

Example response (JSON)
{
  "data": {
    "id": "2ndCYJK",
    "title": "c1f64245afb2",
    "url_viewer": "https://ibb.co/2ndCYJK",
    "url": "https://i.ibb.co/w04Prt6/c1f64245afb2.gif",
    "display_url": "https://i.ibb.co/98W13PY/c1f64245afb2.gif",
    "width":"1",
    "height":"1",
    "size": "42",
    "time": "1552042565",
    "expiration":"0",
    "image": {
      "filename": "c1f64245afb2.gif",
      "name": "c1f64245afb2",
      "mime": "image/gif",
      "extension": "gif",
      "url": "https://i.ibb.co/w04Prt6/c1f64245afb2.gif",
    },
    "thumb": {
      "filename": "c1f64245afb2.gif",
      "name": "c1f64245afb2",
      "mime": "image/gif",
      "extension": "gif",
      "url": "https://i.ibb.co/2ndCYJK/c1f64245afb2.gif",
    },
    "medium": {
      "filename": "c1f64245afb2.gif",
      "name": "c1f64245afb2",
      "mime": "image/gif",
      "extension": "gif",
      "url": "https://i.ibb.co/98W13PY/c1f64245afb2.gif",
    },
    "delete_url": "https://ibb.co/2ndCYJK/670a7e48ddcb85ac340c717a41047e5c"
  },
  "success": true,
  "status": 200
}
Drag and drop or paste images here to upload
You can also browse from your computer or add image URLs.
JPG PNG BMP GIF TIF WEBP HEIC AVIF PDF 32 MBclose
