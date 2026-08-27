require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function setupBucket() {
  console.log('\n🚀  Configurando bucket de Supabase Storage...\n');

  // 1. Verificar si ya existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('❌  Error al listar buckets:', listError.message);
    process.exit(1);
  }

  const bucketName = process.env.SUPABASE_BUCKET || 'encontrarte';
  const exists = buckets.some(b => b.name === bucketName);

  if (exists) {
    console.log(`ℹ️   El bucket "${bucketName}" ya existe.`);
  } else {
    // 2. Crear bucket público
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'],
      fileSizeLimit: 5242880, // 5 MB
    });

    if (createError) {
      console.error('❌  Error al crear el bucket:', createError.message);
      process.exit(1);
    }

    console.log(`✅  Bucket "${bucketName}" creado exitosamente como PÚBLICO.`);
  }

  // 3. Listar carpetas/estructura actual
  console.log('\n📂  Estructura actual del bucket:');
  const { data: files, error: filesError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 100 });

  if (!filesError && files) {
    if (files.length === 0) {
      console.log('   (vacío — listo para recibir imágenes)');
    } else {
      files.forEach(f => console.log(`   - ${f.name}`));
    }
  }

  // 4. Test de conectividad: subir un archivo de prueba pequeño y borrarlo
  console.log('\n🧪  Probando conectividad (upload/delete test)...');
  const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const testPath = 'test/conectividad.png';

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testPath, testBuffer, { upsert: true, contentType: 'image/png' });

  if (uploadError) {
    console.error('❌  Error en test de upload:', uploadError.message);
    console.error('   Asegúrate de que el SUPABASE_KEY sea la "service_role key", no la "anon key".');
    process.exit(1);
  }

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(testPath);
  console.log(`✅  Upload OK. URL pública de prueba: ${urlData.publicUrl}`);

  // Limpiar archivo de prueba
  await supabase.storage.from(bucketName).remove([testPath]);
  console.log('🧹  Archivo de prueba eliminado.');

  console.log('\n🎉  ¡Todo listo! El bucket está configurado y funcionando.\n');
  process.exit(0);
}

setupBucket();
