import { signInModel, signUpModel,createUserProfile,SignInCredentials,SignUpCredentials } from '@/app/model/authentication_model';


export class AuthController {

    static validateSignUp(signUpData: SignUpCredentials): { isValid: boolean; error?: string } {
      // Check all fields are present
      if (!signUpData.nric || !signUpData.username || !signUpData.password || !signUpData.town) {
        return { isValid: false, error: 'Please enter NRIC, username, password and select a town' };
      }

      // Validate NRIC format
      const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
      if (!nricRegex.test(signUpData.nric)) {
        return { isValid: false, error: 'Please enter a valid NRIC format (e.g., S1234567A)' };
      }

      // Validate username length
      if (signUpData.username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' };
      }

      // Validate password length
      if (signUpData.password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
      }

      return { isValid: true };
    }

  // Authentication methods
  static async signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const { data, error } = await signInModel(credentials);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
            
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async signUp(signUpData: SignUpCredentials): Promise<{ success: boolean; error?: string }> {
      console.log(signUpData)
    try {
        console.log("came here")
      // Validate input
      const  validation  = this.validateSignUp(signUpData);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      console.log('Calling sign up here')
      // Sign up user
      const { data, error } = await signUpModel(signUpData);

      if (error) {
        return { success: false, error: error.message };
      }

      console.log('Creating user profile' +  data)
      if (data.user) {
          
      console.log('Creating user profile', data.user)
        // Create user profile
         await createUserProfile(
          data.user.id,
          signUpData.nric.toUpperCase(),
          signUpData.username,
          signUpData.town
        );


        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }




}
