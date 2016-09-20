var path = require("path");

module.exports = {
    entry: {
        app: [
            './js/app.js',
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/only-dev-server'
        ]
    },

    output: {
        publicPath: 'http://localhost:8080',
        filename: '[name].js'
    },

    devServer:{
         proxy: {
	    		'/socket.io/*':{
					target: 'http://localhost:8080',
	    		},
	    		'/comms/*':{
					target: 'http://localhost:8080',
	    		}
        }
    },

    module: {
        loaders:[
                { test: /\.js$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
                { test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
                { test: /\.css$/, loaders: ['style', 'css'] },
                { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'},
                { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff/[name].[ext]" },
                { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?limit=8192" },
        ],
    },

};
