# Stage 1
FROM node:8 as dashboard-build
WORKDIR /app
COPY . ./
RUN npm install
RUN npm rebuild node-sass
RUN npm run build

# CMD ["npm","start"]
# # Stage 2 - the production environment
 FROM nginx:alpine
 # COPY nginx.conf /etc/nginx/conf.d/default.conf
 RUN set -x ; \
   addgroup -g 82 -S www-data ; \
   adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1
 COPY nginx.conf /etc/nginx/nginx.conf
 COPY --from=dashboard-build /app/build /usr/share/nginx/html
 #EXPOSE 80
 CMD ["nginx", "-g", "daemon off;"]

