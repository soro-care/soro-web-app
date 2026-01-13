#!/bin/bash

echo "📚 Setting up Swagger API Documentation..."

# Install Swagger
npm install --save @nestjs/swagger swagger-ui-express

# Build the app
npm run build

# Start server
npm run start:dev

echo "✅ Done!"
echo ""
echo "📚 API Documentation available at:"
echo "   http://localhost:5001/api/docs"
echo ""
echo "📄 OpenAPI JSON:"
echo "   http://localhost:5001/api/docs-json"
```

## 📊 STEP 6: Postman Collection Export

The Swagger UI automatically generates a Postman-compatible collection. Access it at:
```
http://localhost:5001/api/docs-json