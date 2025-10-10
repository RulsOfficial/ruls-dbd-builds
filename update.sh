# 1️⃣ Instalar dependencias
npm install axios jsdom

# 2️⃣ Ejecutar el script de actualización
cd js
node update-perks.js
cd ..

# 3️⃣ Limpiar node_modules y package.json
rm -rf node_modules
rm -f package.json package-lock.json

# 4️⃣ Commit y push a Git
git add .
git commit -m "Autoupdate"
git push

echo "✅ Script finalizado y cambios subidos a Git"