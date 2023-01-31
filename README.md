# Hackrithmitic-2 2023: Math GPT

By Aneeljyot Alagh, Curtis Kan, and Joshua Ji.

This project takes an equation uses Chat GPT to do computations that the user specifies. They can choose from a dropdown of common computations or create their own.

## How to Run

### Prerequisites 

Create an Open AI account and get an API key. Then, create a file called `.env.local` in the root directory and add the key to the environment variable `OPENAI_API_KEY`.

```
OPENAI_API_KEY=************************
```

### Devcontainers/Codespaces (Nodejs 18)

This project uses devcontainers to make it easy to run. If you have VSCode and a working installation of Docker, you can just open the project in a container with a full IDE configuration. You can also open it in a codespace on GitHub.

Once inside the devcontainer, run the following to open the project in a browser.

```
npm i
npm run dev
```

## Tools Used

### Frontend

- [Chakra UI](https://chakra-ui.com/) for easy components to use.
- [React loading icons](https://www.npmjs.com/package/react-loading-icons) for animated loading icons.
- [Mathlive](https://cortexjs.io/mathlive/) and [Mathquill](http://mathquill.com/) for LaTex input and output.


### Backend

- [Open AI](https://openai.com/api/) to communicate with GPT-3.
- [Next.JS](https://nextjs.org/)'s serverless functions.
- [Vercel](https://vercel.com/) for hosting.


## Screenshots

[Take a look at our devpost](https://devpost.com/software/math-gpt)!

