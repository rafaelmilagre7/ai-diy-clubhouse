import { supabase } from "@/lib/supabase/client";
import { generateRandomString } from "./stringGenerator";

const generateRandomEmail = () => {
  const randomString = generateRandomString(10);
  return `testuser_${randomString}@example.com`;
};

/**
 * Create test user data
 */
export const createTestUser = async (
  role: string = "member", 
  customEmail?: string,
  customPassword?: string
) => {
  const email = customEmail || generateRandomEmail();
  const password = customPassword || "test1234";
  let id: string;
  
  try {
    // Check if user already exists
    const existingUser = await checkTestUserExists(role, email);
    
    if (existingUser?.exists && existingUser?.id) {
      console.warn(`Test user with role ${role} and email ${email} already exists. Using existing user.`);
      id = existingUser.id;
    } else {
      // Create user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: `Test User ${role}`,
            role: role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("No user found after signup");
      }
      
      id = data.user.id;
    }
    
    // Add to profiles
    await supabase.from("profiles").insert({
      id: id,
      name: `Test User ${role}`,
      email: email,
      role: role,
      // Encontre o role_id pelo nome do role
      role_id: await getRoleIdByName(role)
    });
    
    // Sign out to prevent conflicts with current user
    await supabase.auth.signOut();
    
    console.log(`Test user with role ${role} and email ${email} created successfully`);
    
    return {
      id: id,
      email: email,
      password: password,
    };
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
};

/**
 * Obtém o role_id pelo nome do role
 */
async function getRoleIdByName(roleName: string): Promise<string | undefined> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("id")
      .eq("name", roleName)
      .single();
      
    if (error || !data) return undefined;
    return data.id;
  } catch (error) {
    console.error("Error getting role ID:", error);
    return undefined;
  }
}

/**
 * Check if test user already exists
 */
export const checkTestUserExists = async (role: string, email: string) => {
  try {
    const roleName = role;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();
    
    if (error) {
      console.error("Error checking test user exists:", error);
      return { exists: false, id: null };
    }
    
    if (data?.role === roleName) {
      return { exists: true, id: data.id };
    }
    
    return { exists: false, id: null };
  } catch (error) {
    console.error("Error checking test user exists:", error);
    return { exists: false, id: null };
  }
};
