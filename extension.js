const vscode = require('vscode');

/**
 * This method is called when your extension is activated.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // --- Command to Comment Out console.log ---
    let commentCommand = vscode.commands.registerCommand('console-log-commenter.commentLogs', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const edits = [];
        // Regex to find console.log statements that are not already commented out.
        // It looks for 'console.log(...);' on each line.
        const regex = /console\.log\(.*\);/g;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            // Skip lines that are already fully commented
            if (line.text.trim().startsWith('//')) {
                continue;
            }

            // Find all matches on the current line
            for (const match of line.text.matchAll(regex)) {
                if (match.index !== undefined) {
                    const matchRange = new vscode.Range(
                        new vscode.Position(i, match.index),
                        new vscode.Position(i, match.index + match[0].length)
                    );
                    // Replace the matched text with its commented version
                    edits.push(vscode.TextEdit.replace(matchRange, `// ${match[0]}`));
                }
            }
        }
        
        if (edits.length > 0) {
            const workEdits = new vscode.WorkspaceEdit();
            workEdits.set(document.uri, edits); // Apply edits to the correct file
            vscode.workspace.applyEdit(workEdits);
            vscode.window.showInformationMessage(`Commented out ${edits.length} console.log statement(s).`);
        } else {
            vscode.window.showInformationMessage('No active console.log statements found to comment out.');
        }
    });


    // --- Command to Uncomment console.log ---
    let uncommentCommand = vscode.commands.registerCommand('console-log-commenter.uncommentLogs', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const edits = [];
        // Regex to find commented out console.log statements and capture the actual code
        const regex = /\/\/\s*(console\.log\(.*\);)/g;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);

            for (const match of line.text.matchAll(regex)) {
                if (match.index !== undefined) {
                    const matchRange = new vscode.Range(
                        new vscode.Position(i, match.index),
                        new vscode.Position(i, match.index + match[0].length)
                    );
                    // Replace the entire match (e.g., '// console.log("Hi");')
                    // with just the captured group (e.g., 'console.log("Hi");')
                    edits.push(vscode.TextEdit.replace(matchRange, match[1]));
                }
            }
        }
        
        if (edits.length > 0) {
            const workEdits = new vscode.WorkspaceEdit();
            workEdits.set(document.uri, edits);
            vscode.workspace.applyEdit(workEdits);
            vscode.window.showInformationMessage(`Uncommented ${edits.length} console.log statement(s).`);
        } else {
            vscode.window.showInformationMessage('No commented out console.log statements found.');
        }
    });

    context.subscriptions.push(commentCommand, uncommentCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
