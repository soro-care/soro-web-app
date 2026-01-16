import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    allCategories: [],
    loadingCategories: false,
    blogPosts: [],
    featuredPosts: [],
    recentPosts: [],
    currentPost: null,
    loadingPosts: false
}

const blogSlice = createSlice({
    name: 'blog',
    initialState: initialValue,
    reducers: {
        setAllCategories: (state, action) => {
            state.allCategories = [...action.payload]
        },
        setLoadingCategories: (state, action) => {
            state.loadingCategories = action.payload
        },
        setBlogPosts: (state, action) => {
            state.blogPosts = [...action.payload]
        },
        setFeaturedPosts: (state, action) => {
            state.featuredPosts = [...action.payload]
        },
        setRecentPosts: (state, action) => {
            state.recentPosts = [...action.payload]
        },
        setCurrentPost: (state, action) => {
            state.currentPost = action.payload
        },
        setLoadingPosts: (state, action) => {
            state.loadingPosts = action.payload
        }
    }
})

export const { 
    setAllCategories, 
    setLoadingCategories, 
    setBlogPosts,
    setFeaturedPosts,
    setRecentPosts,
    setCurrentPost,
    setLoadingPosts
} = blogSlice.actions

export default blogSlice.reducer