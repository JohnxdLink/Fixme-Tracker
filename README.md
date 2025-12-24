## Run Locally

Clone the project

```bash
  git clone https://github.com/JohnxdLink/Fixme-Tracker.git
```

Go to the project directory

```bash
  cd fixme-tracker
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Run via Docker

Make sure you already have docker in your desktop

Docker Build

```bash
  docker build -t fixme-tracker .
```

Run the container

```bash
  docker run -d -p 8080:8080 fixme-tracker
```

Try to access to your browser `localhost:8080`
