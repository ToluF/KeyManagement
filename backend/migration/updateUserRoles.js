// migrations/updateUserRoles.js
const migrateRoles = async () => {
    await User.updateMany(
      { role: 'admin' }, 
      { $set: { role: 'issuer' } } // Or whatever logic you need
    );
    console.log('Updated user roles');
  };