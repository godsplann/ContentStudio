import {Config} from '@remotion/cli/config';

// Three.js needs a WebGL-capable renderer. "angle" works on macOS and Windows.
// On a Linux machine without a GPU, render with:  npx remotion render Demo out/demo.mp4 --gl=swangle
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
