import { app, PORT } from "./src/app.js";

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
