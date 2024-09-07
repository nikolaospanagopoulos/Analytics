import * as esbuild from "esbuild";

try {
  let ctx = await esbuild.context({
    entryPoints: ["index.js"],
    outdir: "dist",
    bundle: true,
    logLevel: "info",
  });

  await ctx.watch();
} catch (error) {
  console.error(error);
}
