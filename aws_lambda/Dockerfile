# Use an official Node.js runtime as a parent image
#FROM public.ecr.aws/lambda/nodejs:20-x
FROM public.ecr.aws/lambda/nodejs:20-x86_64
#FROM node:20-alpine

RUN mkdir -p ${LAMBDA_TASK_ROOT}/node_modules

WORKDIR ${LAMBDA_TASK_ROOT}

COPY package.json ${LAMBDA_TASK_ROOT}

#USER node

#Install any needed dependencies
RUN npm install

COPY server.js ${LAMBDA_TASK_ROOT}


#Copy the previous directory contents into the container at /usr/src/app
COPY . ${LAMBDA_TASK_ROOT}

# Make port 80 available to the world outside this container
EXPOSE 80 8080

# Run app when the container launches
CMD ["index.handler"]
