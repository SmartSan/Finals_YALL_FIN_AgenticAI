# **App Name**: QRReceipt

## Core Features:

- Receipt Parsing: Uses a tool that reads a receipt and converts it into structured data. LLM decides when or whether to omit unimportant fields such as store logos or promotional material, to reduce the size of the QR code that needs to be generated.
- Dual View: Displays both the original receipt image and the generated QR code side-by-side.
- QR Code Download: Allows users to download the generated QR code as a standard image file.
- Scan History: Keeps a history of scanned receipts and generated QR codes, which can be viewed later. These scans are stored in local storage.
- Combined QR Output: Output which attaches QR code along with the uploaded image. The result can then be exported as a document.

## Style Guidelines:

- Primary color: Deep Blue (#194569) to provide a professional and trustworthy feel.
- Background color: Off-White (#F5F5F0) for a clean and readable layout.
- Accent color: Light Blue (#72BCD4), which is analogous to the primary color, but with added brightness for CTAs and key interface elements to highlight user interaction points.
- Font pairing: 'Space Grotesk' (sans-serif) for headers and short snippets of text to give it a techy feel; 'Inter' (sans-serif) for body text, which should remain very readable even at small sizes.
- Use clean, simple icons for actions like upload, download, and save. Icons should complement the professional aesthetic.
- A split-screen layout to display the original receipt and the generated QR code side by side.
- Subtle animations during the receipt upload and QR code generation to provide feedback to the user.