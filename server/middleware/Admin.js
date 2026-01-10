import UserModel from '../models/user.model.js'


const admin = async (request, response, next) => {
    try {
        console.log('User from request:', request.user); // Debugging
        
        if (!request.user) {
            return response.status(401).json({
                message: "Not authenticated",
                error: true,
                success: false
            });
        }

        console.log('User role from token:', request.user.role); // Debugging

        // Check both the token's role and fresh DB data
        const dbUser = await UserModel.findById(request.user.id);
        console.log('DB User role:', dbUser?.role); // Debugging

        if (!dbUser || dbUser.role !== 'ADMIN') {
            return response.status(403).json({
                message: `Permission denied. User role: ${dbUser?.role || 'none'}`,
                error: true,
                success: false
            });
        }

        // Update request with fresh user data
        request.user = dbUser;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return response.status(500).json({
            message: error.message || "Authorization failed",
            error: true,
            success: false
        });
    }
}

export default admin