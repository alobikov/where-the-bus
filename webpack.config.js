const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

console.log(path.resolve(__dirname, "public"));
module.exports = {
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
