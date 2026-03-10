import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch (error) {
                console.error('Error parsing favorites from localStorage:', error);
                setFavorites([]);
            }
        }
    }, []);

    // Save favorites to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (product) => {
        setFavorites(prev => {
            if (prev.some(item => item._id === product._id)) {
                return prev; // Already in favorites
            }
            return [...prev, product];
        });
    };

    const removeFromFavorites = (productId) => {
        setFavorites(prev => prev.filter(item => item._id !== productId));
    };

    const toggleFavorite = (product) => {
        const isFavorite = favorites.some(item => item._id === product._id);
        if (isFavorite) {
            removeFromFavorites(product._id);
        } else {
            addToFavorites(product);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(item => item._id === productId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};