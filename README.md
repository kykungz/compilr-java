# compilr-java
> Docker-based java compiler API server

## Installation
- Required [Docker](https://www.docker.com/)

### 1.) Download directly from Docker Hub

```bash
# download and run kykungz/compilr-java image (port 8080)
docker run -it -p 8080:8080 --name compilr-java kykungz/compilr-java
```

### 2.) Clone and build new image (Configurable)

```bash
# clone the repository
git clone https://github.com/kykungz/compilr-java.git && cd compilr-java

# -----edit config.js file-----

# build an image
docker build -t kykungz/compilr-java .
# run kykungz/compilr-java image (port 8080)
docker run -it -p 8080:8080 --name compilr-java kykungz/compilr-java
```
With this installation, you can configure the environment by editing `config.js` file before building an image. See [Configuration](#configuration)
below.

---
After running the script above, you can now access your container using command:
```bash
# open current tty
docker attach compilr-java

# OR

# open new tty
docker exec -it compilr-java bash
```
## Usage
### Request
Compilr will create a simple API server on port 8080 by default. You can compile and run your code by sending a HTTP `POST` request to your https://localhost:8080/compile route, with a JSON request body similar to:
```javascript
{ "files": [
  {
    "name": <class_name>,
    "content": <source_code>
  },
  {
    "name": <class_name>,
    "content": <source_code>
  }
] }
```
*Example:*
```javascript
{ "files": [
 {
     "name": "Run",
     "content": "public class Run {public static void main(String[] arg) {System.out.println(Hello World!);}}"
 }
] }
```
### Response
The response will be in JSON format with structure:
```javascript
{
    "success": <boolean>,
    "output": <runnig_result>
}
```
*Example:*
```javascript
{
    "success": true,
    "output": "hello world!10\n"
}
```
If there is a compile/run error, success field will be `false` and the error output will be shown.

---
***compilr also provide a simple code editor frontend on your https://localhost:8080***

![frontend image](https://github.com/kykungz/compilr/blob/master/compilr.png)

# Configuration
`config.js`

| Key     | Detail     |
| :------------- | :------------- |
| TIMEOUT       | Terminal cpu time limit (in seconds)       |
| LOG       | Logging (boolean)       |
