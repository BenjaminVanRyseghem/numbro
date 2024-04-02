import {rimraf} from "rimraf";
import path from "node:path";
import terser from "@rollup/plugin-terser";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import license from "rollup-plugin-license";
import sourcemaps from "rollup-plugin-sourcemaps";
import {sync} from "glob";
import fs from "fs";

export const outputFolder = "dist";
export const languages = sync("./languages/**/*.js");

let langFiles = languages
	.reverse()
	.map(filePath => path.basename(filePath, ".js"))
	.map(file => `exports["${file}"]=require("./dist/languages/${file}.min.js");`)
	.join("");

fs.writeFileSync("./languages.js", langFiles)

export const plugins = [
	nodeResolve(),
	commonjs(),
	sourcemaps(),
	license({
		sourcemap: true,
		thirdParty: {
			output: {
				file: path.resolve(outputFolder, "dependencies.txt"),
			},
		},
	}),
];


export default async () => {
	await rimraf(outputFolder); // rm -rf the output folder first

	return [
		{
			input: [
				"./src/numbro.js",
			],
			output: [
				{
					file: path.resolve(outputFolder, "numbro.js"),
					format: "umd",
					name: "numbro"
				},
				{
					file: path.resolve(outputFolder, "numbro.min.js"),
					format: "umd",
					sourcemap: true,
					plugins: [terser()],
					name: "numbro"
				},
				{
					file: path.resolve(outputFolder, "es", "numbro.js"),
					format: "es",
					name: "numbro"
				},
			],
			plugins,
		},
		...languages.map((input) => {
			let extension = path.extname(input);
			let baseName = path.basename(input, extension);

			return {
				input,
				output: [
					{
						file: path.resolve(outputFolder, "languages", `${baseName}.min.js`),
						format: "umd",
						sourcemap: true,
						plugins: [terser()],
						name: `numbro.${baseName}`
					},
					{
						file: path.resolve(outputFolder, "es", "languages", `${baseName}.js`),
						format: "es",
						name: `numbro.${baseName}`
					},
				],
				plugins,
			};
		}),
		{
			input: "./languages.js",
			output: [
				{
					file: path.resolve(outputFolder, "languages.min.js"),
					format: "umd",
					sourcemap: true,
					plugins: [terser()],
					name: `numbro.allLanguages`
				},
				{
					file: path.resolve(outputFolder, "es", "languages.js"),
					format: "es",
					name: `numbro.allLanguages`
				},
			],
			plugins,
		}
	];
};
