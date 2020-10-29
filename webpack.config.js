const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  let socketPort = "0";
  let baseUrl = "wheremybus.info";
  if (argv.mode === "development") {
    socketPort = "9001";
    baseUrl = "localhost:9001";
  }

  console.log("socketPort:", socketPort);
  console.log("base url:", baseUrl);

  return {
    entry: "./src/client/index.js",
    output: {
      path: path.resolve(__dirname, "public"),
      // publicPath: "public/",
      filename: "[contenthash].bundle.js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/client/index.html",
      }),
      new CleanWebpackPlugin(),
      new FaviconsWebpackPlugin({
        logo: path.resolve(__dirname, "src/client/assets", "bus.png"),
        cache: true,
        favicons: {
          icons: {
            appleIcon: false,
            appleStartup: false,
            android: false,
          },
        },
      }),
      new webpack.DefinePlugin({
        __SOCKET_PORT__: socketPort,
        __BASE_URL__: baseUrl,
      }),
    ],
    devtool: "inline-source-map",
    devServer: {
      contentBase: path.resolve(__dirname, "public"),
      port: 9000,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
            },
          ],
        },
        {
          test: /\.html$/,
          use: ["html-loader"],
        },
        {
          test: /\.(svg|png)$/,
          use: [
            {
              loader: "file-loader",
              options: {
                // encoding: true,
                // name: "[name].[has].[ext]",
                outputPath: "assets",
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },
  };
};
