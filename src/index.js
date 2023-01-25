import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import ncp from "ncp";
import { execSync } from "child_process";

function detectPackageManager() {
    let packageManager;
    try {
        execSync("pnpm --version", { stdio: "ignore" });
        packageManager = "pnpm";
    } catch (e) {
        try {
            execSync("yarn --version", { stdio: "ignore" });
            packageManager = "yarn";
        } catch (e) {
            packageManager = "npm";
        }
    }
    return packageManager;
}

async function installDependencies(projectName) {
    const packageManager = detectPackageManager();
    console.log(`Using ${packageManager} to install dependencies`);
    const installCommand = `${packageManager} install`;
    const cwd = path.resolve(process.cwd(), projectName);
    execSync(installCommand, { cwd, stdio: "inherit" });
}

const currentFilePath = path.dirname(import.meta.url.replace(/^file:\/\//, ""));
const validateName = (name) => {
    const regex = /^[a-zA-Z0-9-_]+$/;
    return (
        regex.test(name) ||
        "Name should only contain letters, numbers, dashes and underscores."
    );
};

async function copyTemplate(projectName) {
    const templatePath = path.resolve(currentFilePath, "../template");
    const destinationPath = path.resolve(process.cwd(), projectName);
    await fs.promises.mkdir(destinationPath, { recursive: true });
    await new Promise((resolve, reject) => {
        ncp(templatePath, destinationPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
async function replacePlaceholders(projectName, frontendName, backendName) {
    const destinationPath = path.resolve(process.cwd(), projectName);
    const files = await fs.promises.readdir(destinationPath, {
        withFileTypes: true,
    });

    for (const file of files) {
        let filePath = path.resolve(destinationPath, file.name);
        // Replace placeholders in the file name and rename it
        const newFileName = file.name.replace(/%PROJECT_NAME%/g, projectName)
            .replace(/%FRONTEND_NAME%/g, frontendName)
            .replace(/%BACKEND_NAME%/g, backendName);
        if (newFileName !== file.name) {
            const newFilePath = path.resolve(destinationPath, newFileName);
            await fs.promises.rename(filePath, newFilePath);
            filePath = newFilePath;
        }

        if (file.isDirectory()) {
            await replacePlaceholders(filePath, frontendName, backendName);
        } else {
            let content = await fs.promises.readFile(filePath, "utf8");
            content = content.replace(/%PROJECT_NAME%/g, projectName);
            content = content.replace(/%FRONTEND_NAME%/g, frontendName);
            content = content.replace(/%BACKEND_NAME%/g, backendName);
            await fs.promises.writeFile(filePath, content);
        }
    }
}
async function generateApp(projectName, frontendName, backendName) {
    console.log("Copying template...")
    await copyTemplate(projectName);
    console.log("Replacing placeholders...")
    await replacePlaceholders(projectName, frontendName, backendName);
}
const answers = await inquirer.prompt([
    {
        type: "input",
        name: "projectName",
        message: "Enter a project name:",
        validate: validateName,
    },
    {
        type: "input",
        name: "frontendName",
        message: "Enter a name for your frontend package:",
        validate: validateName,
    },
    {
        type: "input",
        name: "backendName",
        message: "Enter a name for your backend package:",
        validate: validateName,
    },
]);
await generateApp(answers.projectName, answers.frontendName, answers.backendName);
const npmAnswers = await inquirer.prompt([
    {
        type: "confirm",
        name: "installDependencies",
        message: "Install dependencies?",
        default: true,
    },
]);
if (npmAnswers.installDependencies)
    await installDependencies(answers.projectName);

console.log("Done! 🎉");
console.log("To get started, run the following commands:");
console.log(`cd ${answers.projectName}`);
console.log(
    `nx run-many --target=serve --projects=${answers.frontendName},${answers.backendName} --parallel --maxParallel=2`
);
// Ask if the user wants to initialize a git repo
const gitAnswers = await inquirer.prompt([
    {
        type: "confirm",
        name: "initializeGit",
        message: "Initialize a git repository?",
        default: true,
    },
]);
if (gitAnswers.initializeGit) {
    execSync("git init", { cwd: path.join(process.cwd(), answers.projectName) });
}
