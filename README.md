# ShowYUVwithWebGL

TypeScriptとWebGL(OpenGL ES)を使用した、YUV⇒RGB変換、動画表示のサンプルコードです。  
最初はHTML5の`<canvas>`要素にCanvas 2D Contextを用いて描画しています。  
YUV⇒RGB変換については最初はTypeScriptで記述しますが、最終的にはGLSL ESを用いてGPU側で行うようにします。  
IDEはVisual Studio Codeを使用しています。

なおYUVのファイルは[Arizona State Universityのページ](http://trace.eas.asu.edu/yuv/)のCIFファイルを使用してください。

詳細な説明は
[YUV⇒RGB変換(WebGL編)](https://yoshia.mydns.jp/programming/?p=502)
を参照してください。

tagは以下の章に対応しています。

- empty: index.htmlへの各要素の配置
- show-rgb-with-canvas2d: コンパイルと実行
- show-rgb-with-canvasgl: Canvas WebGL Contextによる描画(RGBテクスチャ)の実行
- show-yuv-with-canvasgl: Canvas WebGL Contextによる描画(YUVテクスチャ)の実行
