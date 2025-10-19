import { resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Plugin to inject CSS import in the output
function injectCssImport() {
  let outputDir = '';

  return {
    name: 'inject-css-import',
    configResolved(config: unknown) {
      const cfg = config as Record<string, unknown>;
      const buildCfg = cfg.build as Record<string, unknown>;
      outputDir = (buildCfg.outDir as string) || 'lib';
    },
    writeBundle() {
      const cssFile = 'transparent-video-react.css';
      const files = [
        { js: 'transparent-video-react.mjs', map: 'transparent-video-react.mjs.map', format: 'es' },
        {
          js: 'transparent-video-react.cjs',
          map: 'transparent-video-react.cjs.map',
          format: 'cjs',
        },
      ];

      for (const { js, map, format } of files) {
        const jsPath = join(outputDir, js);
        const mapPath = join(outputDir, map);

        if (existsSync(jsPath)) {
          const content = readFileSync(jsPath, 'utf-8');
          let cssImport = '';

          if (format === 'es') {
            cssImport = `import './${cssFile}';\n`;
          } else if (format === 'cjs') {
            cssImport = `require('./${cssFile}');\n`;
          }

          if (!content.includes(cssImport.trim())) {
            const newContent = cssImport + content;
            writeFileSync(jsPath, newContent, 'utf-8');

            // Update source map if it exists
            if (existsSync(mapPath)) {
              const mapContent = JSON.parse(readFileSync(mapPath, 'utf-8'));
              // Adjust source map to account for the new line
              if (mapContent.mappings) {
                mapContent.mappings = ';' + mapContent.mappings;
              }
              writeFileSync(mapPath, JSON.stringify(mapContent), 'utf-8');
            }
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: 'src',
      exclude: ['src/stories'],
      outDir: 'lib/types',
      tsconfigPath: './tsconfig.app.json',
    }),
    injectCssImport(),
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),

      name: 'TransparentVideoReact',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'transparent-video-react.mjs' : 'transparent-video-react.cjs',
    },
    rollupOptions: {
      external: (id) => {
        return (
          ['react', 'react-dom', 'react/jsx-runtime'].some((item) => id.startsWith(item)) ||
          id.startsWith('node_modules')
        );
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: true,
  },
});
