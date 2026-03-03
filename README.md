
# CartoonForge - AI Cartoonizer Website

Official frontend website for **CartoonForge**, built using **Next.js** with **TypeScript** and **Tailwind CSS**, featuring a modern UI, reusable components, smooth animations, and a scalable architecture.

This app allows users to upload photos and convert them into crisp, cel-shaded cartoons using neural models (CartoonGAN, FastStyle) or OpenCV pipelines. Presets inspired by popular styles like *Family Guy*, *Ben 10*, or *Avengers* are included, along with optional super-resolution.

- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## Features

- Upload photos and preview instantly.
- Multiple stylization modes:
  - Neural Cartoon (CartoonGAN)
  - Fast Style Transfer
  - OpenCV Cartoon (fast)
  - Cel Cartoon (customizable outlines + posterize)
  - Sketch (pencil sketch)
  - Stylize (artistic filter)
- Adjustable parameters: strength, posterize levels, palette colors, outline thickness.
- Optional Super-Resolution if backend supports Real-ESRGAN.
- Side-by-side original vs stylized image comparison with slider.
- Download or open stylized images directly.

---

## Running Locally
### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ahken-Labs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the values in `.env` as needed for your environment.

### 4. Run the Application

```bash
# Development mode with auto-restart
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

