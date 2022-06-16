# Contributing to commonform.org

All data about publishers, projects, and forms lives in [`./data`](./data).

Images, styles, and other static assets live in [`./static`](./static).

The code for generating webpages, downloads, and indexes starts in [`./generate.js`](./generate.js).

## Creating a Publisher Profile

You can create a publisher profile for yourself by sending a pull request on GitHub.

1.  Pick an account name for yourself, like `kemitchell`, that's all lower-case letters, like `jdoe`. Some variation on your name is highly encouraged.

2.  Create a new directory with your account name in [`./forms`](./forms), like `./forms/jdoe`.

3.  Copy [`./forms/kemitchell/index.md`](./forms/kemitchell.index.md) to your directly, like `./forms/jdoe/index.md`.

4.  Edit the new file with your own details.

## Creating a Project

Once you've created a publisher profile for yourself, you can create projects.

1.  Create a codename for your project, like `bill-of-sale`, that's all lower-case letters and dashes.

2.  Create a new directory with your project codename within your publisher directory, like `./forms/jdoe/bill-of-sale`.

3.  Copy [`./forms/kemitchell/fairshake/index.md`](./forms/kemitchell/fairshake/index.md) into your new project directory, like `./forms/jdoe/bill-of-sale/index.md`.

4.  Edit the new file with details for your project.

## Publishing a Form

Once you've created a project, you can publish forms under it.

1.  Determine the [Legal Versioning number](https://legalversioning.com) for your form, like `1.0.0-1` for "first draft of first edition" or `3.0.0` for "third edition".

2.  Copy [`./forms/kemitchell/fairshake/1.0.0.md`](./forms/kemitchell/fairshake/1.0.0.md) into your project directory. Rename the file to match the version of your form, like `./forms/jdoe/bill-of-sale/1.0.0.md`.

3.  Edit the new file with the content of your form.
