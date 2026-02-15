import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchRole(session.user.id);
            } else {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                setLoading(false);
                return;
            }

            const userRole = data?.role;

            // Enforcement: If member, check payment status
            if (userRole === 'member') {
                const { data: leadData, error: leadError } = await supabase
                    .from('leads')
                    .select('payment_status')
                    .eq('created_by', userId)
                    .single();

                if (leadError || leadData?.payment_status !== 'received') {
                    console.log('Access denied: Payment pending or lead not found.');
                    await supabase.auth.signOut();
                    setUser(null);
                    setRole(null);
                    alert("Your account is pending review. Access will be granted once payment is confirmed by the administrator.");
                    setLoading(false);
                    return;
                }
            }

            setRole(userRole);
        } catch (err) {
            console.error('Unexpected error fetching role:', err);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        role,
        loading,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
