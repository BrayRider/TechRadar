const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CheckerPlugin = require("awesome-typescript-loader").CheckerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
    // Configuration in common to both client-side and server-side bundles
    const isDevBuild = !(env && env.prod);
    const sharedConfig = {
        stats: { modules: false },
        context: __dirname,
        resolve: { extensions: [".ts", ".js", ".css", ".scss", ".json" ] },
        output: {
            filename: "[name].js",
            publicPath: "/dist/" // Webpack dev middleware, if enabled, handles requests for this URL prefix
        },
        module: {
            rules: [
                {
                    test: /\.ts$/, include: /ClientApp/,
                    use: ["awesome-typescript-loader?silent=true", "angular2-template-loader"]
                },
                { test: /\.html$/, use: "html-loader?minimize=false" },
                {
                    test: /\.css$/,
                    use: ["raw-loader"]
                },

                {
                    test: /\.scss$/,
                    use: ["raw-loader", "sass-loader"]
                },
                {
                    test: /sass\/initial\.scss$/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader!sass-loader?sourceMap"
                    })
                },
                {
                    test: /\.woff(2)?(\?v=.+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    exclude: /node_modules/,
                    use: "url-loader?limit=25000"
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin({ filename: "initial.css", allChunks: true }),
            new FaviconsWebpackPlugin("./ClientApp/assets/RadarIcon.png"),
            new HtmlWebpackPlugin(),
            new CheckerPlugin()
        ]
    };

    // Configuration for client-side bundle suitable for running in browsers
    const clientBundleOutputDir = "./wwwroot/dist";
    const clientBundleConfig = merge(sharedConfig, {
        entry: { 'main-client': "./ClientApp/boot-client.ts" },
        output: { path: path.join(__dirname, clientBundleOutputDir) },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require("./wwwroot/dist/vendor-manifest.json")
            })
        ].concat(isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: "[file].map", // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(clientBundleOutputDir, "[resourcePath]") // Point sourcemap entries to the original file locations on disk
            })
        ] : [
            // Plugins that apply in production builds only
                new webpack.NormalModuleReplacementPlugin(/environment.dev/, function (result) {
                    // Replace Dev config variables with prod ones
                    result.request = result.request.replace(/environment.dev/, "environment.prod");
            }),
//                new webpack.NormalModuleReplacementPlugin(/ClientApp\/environments\/environment.dev/, "./environment.prod"),
                new webpack.optimize.UglifyJsPlugin()
        ])
    });

    // Configuration for server-side (prerendering) bundle suitable for running in Node
    const serverBundleConfig = merge(sharedConfig, {
        resolve: { mainFields: ["main"] },
        entry: { 'main-server': "./ClientApp/boot-server.ts" },
        plugins: [
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require("./ClientApp/dist/vendor-manifest.json"),
                sourceType: "commonjs2",
                name: "./vendor"
            })
        ],
        output: {
            libraryTarget: "commonjs",
            path: path.join(__dirname, "./ClientApp/dist")
        },
        target: "node",
        devtool: "inline-source-map"
    });

    return [clientBundleConfig, serverBundleConfig];
};
