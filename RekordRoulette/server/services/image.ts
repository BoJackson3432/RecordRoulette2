import satori from "satori";
// Note: @resvg/resvg-js should be installed via npm
// For now, we'll create a stub that returns a placeholder

export interface ShareImageData {
  albumName: string;
  artistName: string;
  coverUrl: string;
  userName?: string;
}

export async function generateShareImage(data: ShareImageData): Promise<Buffer> {
  try {
    // Create the JSX structure for the share image
    // Create the JSX structure for the share image using object syntax
    const jsx = {
      type: "div",
      props: {
        style: {
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1117 0%, #21262d 50%, #161b22 100%)",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
        },
        children: [
          // Header
          {
            type: "div",
            props: {
              style: {
                fontSize: 72,
                fontWeight: "bold",
                marginBottom: 40,
                background: "linear-gradient(90deg, #10b981, #ec4899, #f59e0b)",
                backgroundClip: "text",
                color: "transparent",
              },
              children: "RecordRoulette",
            },
          },
          
          // Vinyl/Roulette Frame
          {
            type: "div",
            props: {
              style: {
                width: 800,
                height: 800,
                borderRadius: 400,
                background: "radial-gradient(circle, #21262d 20%, #0d1117 40%, #21262d 60%, #0d1117 80%)",
                border: "8px solid #10b981",
                boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginBottom: 60,
              },
              children: [
                // Album Cover
                {
                  type: "img",
                  props: {
                    src: data.coverUrl || "",
                    style: {
                      width: 600,
                      height: 600,
                      borderRadius: 300,
                      objectFit: "cover",
                    },
                  },
                },
                
                // Center spindle
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      background: "#f59e0b",
                      border: "4px solid #0f0f0f",
                    },
                  },
                },
              ],
            },
          },
          
          // Text
          {
            type: "div",
            props: {
              style: {
                textAlign: "center",
                maxWidth: 900,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 48,
                      fontWeight: "bold",
                      marginBottom: 20,
                    },
                    children: `I spun "${data.albumName}"`,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 36,
                      color: "#9ca3af",
                      marginBottom: 40,
                    },
                    children: `by ${data.artistName}`,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 32,
                      color: "#10b981",
                    },
                    children: "on RecordRoulette 🎵",
                  },
                },
              ],
            },
          },
        ],
      },
    } as any;

    const svg = await satori(jsx, {
      width: 1080,
      height: 1920,
      fonts: [
        {
          name: 'Inter',
          data: Buffer.from(''), // Placeholder - in production you'd load actual font data
          weight: 400,
          style: 'normal',
        },
      ],
    });

    // For now, return the SVG as buffer since @resvg/resvg-js might need special setup
    // In production: const resvg = new Resvg(svg); return resvg.render().asPng();
    return Buffer.from(svg);
  } catch (error) {
    console.error("Error generating share image:", error);
    // Return a simple placeholder
    const placeholderSvg = `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0f0f0f"/>
      <text x="540" y="960" text-anchor="middle" fill="#10b981" font-size="72" font-family="Arial">
        RecordRoulette Share
      </text>
    </svg>`;
    return Buffer.from(placeholderSvg);
  }
}
