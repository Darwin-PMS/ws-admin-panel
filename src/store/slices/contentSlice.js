import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    tips: [],
    articles: [],
    tutorials: [],
    news: [],
    laws: [],
    helplines: [],
    loading: false,
    error: null,
    currentTab: 0,
    pagination: {
        tutorials: { page: 0, rowsPerPage: 10, total: 0 },
        news: { page: 0, rowsPerPage: 10, total: 0 },
        laws: { page: 0, rowsPerPage: 10, total: 0 },
        helplines: { page: 0, rowsPerPage: 10, total: 0 },
    },
};

// Async thunks for Tips
export const fetchTips = createAsyncThunk(
    'content/fetchTips',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getTips(params);
            if (response.data.success) {
                return response.data.tips || [];
            }
            return rejectWithValue('Failed to fetch tips');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const addTip = createAsyncThunk(
    'content/addTip',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.addTip(data);
            if (response.data.success) {
                return response.data.tip;
            }
            return rejectWithValue('Failed to add tip');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateTip = createAsyncThunk(
    'content/updateTip',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateTip(id, data);
            if (response.data.success) {
                return response.data.tip;
            }
            return rejectWithValue('Failed to update tip');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteTip = createAsyncThunk(
    'content/deleteTip',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteTip(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete tip');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunks for Articles
export const fetchArticles = createAsyncThunk(
    'content/fetchArticles',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getArticles(params);
            if (response.data.success) {
                return response.data.articles || [];
            }
            return rejectWithValue('Failed to fetch articles');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const addArticle = createAsyncThunk(
    'content/addArticle',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.addArticle(data);
            if (response.data.success) {
                return response.data.article;
            }
            return rejectWithValue('Failed to add article');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateArticle = createAsyncThunk(
    'content/updateArticle',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateArticle(id, data);
            if (response.data.success) {
                return response.data.article;
            }
            return rejectWithValue('Failed to update article');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteArticle = createAsyncThunk(
    'content/deleteArticle',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteArticle(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete article');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunks for Tutorials
export const fetchTutorials = createAsyncThunk(
    'content/fetchTutorials',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getTutorials(params);
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    total: response.data.pagination?.total || 0,
                };
            }
            return rejectWithValue('Failed to fetch tutorials');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createTutorial = createAsyncThunk(
    'content/createTutorial',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createTutorial(data);
            if (response.data.success) {
                return response.data.tutorial;
            }
            return rejectWithValue('Failed to create tutorial');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateTutorial = createAsyncThunk(
    'content/updateTutorial',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateTutorial(id, data);
            if (response.data.success) {
                return response.data.tutorial;
            }
            return rejectWithValue('Failed to update tutorial');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteTutorial = createAsyncThunk(
    'content/deleteTutorial',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteTutorial(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete tutorial');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunks for News
export const fetchNews = createAsyncThunk(
    'content/fetchNews',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getNews(params);
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    total: response.data.pagination?.total || 0,
                };
            }
            return rejectWithValue('Failed to fetch news');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createNews = createAsyncThunk(
    'content/createNews',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createNews(data);
            if (response.data.success) {
                return response.data.news;
            }
            return rejectWithValue('Failed to create news');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateNews = createAsyncThunk(
    'content/updateNews',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateNews(id, data);
            if (response.data.success) {
                return response.data.news;
            }
            return rejectWithValue('Failed to update news');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteNews = createAsyncThunk(
    'content/deleteNews',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteNews(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete news');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunks for Laws
export const fetchLaws = createAsyncThunk(
    'content/fetchLaws',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getLaws(params);
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    total: response.data.pagination?.total || 0,
                };
            }
            return rejectWithValue('Failed to fetch laws');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createLaw = createAsyncThunk(
    'content/createLaw',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createLaw(data);
            if (response.data.success) {
                return response.data.law;
            }
            return rejectWithValue('Failed to create law');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateLaw = createAsyncThunk(
    'content/updateLaw',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateLaw(id, data);
            if (response.data.success) {
                return response.data.law;
            }
            return rejectWithValue('Failed to update law');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteLaw = createAsyncThunk(
    'content/deleteLaw',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteLaw(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete law');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

// Async thunks for Helplines
export const fetchHelplines = createAsyncThunk(
    'content/fetchHelplines',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getHelplines(params);
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    total: response.data.pagination?.total || 0,
                };
            }
            return rejectWithValue('Failed to fetch helplines');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createHelpline = createAsyncThunk(
    'content/createHelpline',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createHelpline(data);
            if (response.data.success) {
                return response.data.helpline;
            }
            return rejectWithValue('Failed to create helpline');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateHelpline = createAsyncThunk(
    'content/updateHelpline',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateHelpline(id, data);
            if (response.data.success) {
                return response.data.helpline;
            }
            return rejectWithValue('Failed to update helpline');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteHelpline = createAsyncThunk(
    'content/deleteHelpline',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteHelpline(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete helpline');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload;
        },
        setContentPage: (state, action) => {
            const { contentType, page } = action.payload;
            if (state.pagination[contentType]) {
                state.pagination[contentType].page = page;
            }
        },
        setContentRowsPerPage: (state, action) => {
            const { contentType, rowsPerPage } = action.payload;
            if (state.pagination[contentType]) {
                state.pagination[contentType].rowsPerPage = rowsPerPage;
                state.pagination[contentType].page = 0;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Tips
            .addCase(fetchTips.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTips.fulfilled, (state, action) => { state.loading = false; state.tips = action.payload; })
            .addCase(fetchTips.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(addTip.fulfilled, (state, action) => { state.tips.push(action.payload); })
            .addCase(updateTip.fulfilled, (state, action) => {
                const index = state.tips.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.tips[index] = action.payload;
            })
            .addCase(deleteTip.fulfilled, (state, action) => { state.tips = state.tips.filter(t => t.id !== action.payload); })

            // Articles
            .addCase(fetchArticles.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchArticles.fulfilled, (state, action) => { state.loading = false; state.articles = action.payload; })
            .addCase(fetchArticles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(addArticle.fulfilled, (state, action) => { state.articles.push(action.payload); })
            .addCase(updateArticle.fulfilled, (state, action) => {
                const index = state.articles.findIndex(a => a.id === action.payload.id);
                if (index !== -1) state.articles[index] = action.payload;
            })
            .addCase(deleteArticle.fulfilled, (state, action) => { state.articles = state.articles.filter(a => a.id !== action.payload); })

            // Tutorials
            .addCase(fetchTutorials.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTutorials.fulfilled, (state, action) => {
                state.loading = false;
                state.tutorials = action.payload.data;
                state.pagination.tutorials.total = action.payload.total;
            })
            .addCase(fetchTutorials.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createTutorial.fulfilled, (state, action) => { state.tutorials.push(action.payload); })
            .addCase(updateTutorial.fulfilled, (state, action) => {
                const index = state.tutorials.findIndex(t => t.id === action.payload.id);
                if (index !== -1) state.tutorials[index] = action.payload;
            })
            .addCase(deleteTutorial.fulfilled, (state, action) => {
                state.tutorials = state.tutorials.filter(t => t.id !== action.payload);
            })

            // News
            .addCase(fetchNews.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.loading = false;
                state.news = action.payload.data;
                state.pagination.news.total = action.payload.total;
            })
            .addCase(fetchNews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createNews.fulfilled, (state, action) => { state.news.push(action.payload); })
            .addCase(updateNews.fulfilled, (state, action) => {
                const index = state.news.findIndex(n => n.id === action.payload.id);
                if (index !== -1) state.news[index] = action.payload;
            })
            .addCase(deleteNews.fulfilled, (state, action) => {
                state.news = state.news.filter(n => n.id !== action.payload);
            })

            // Laws
            .addCase(fetchLaws.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchLaws.fulfilled, (state, action) => {
                state.loading = false;
                state.laws = action.payload.data;
                state.pagination.laws.total = action.payload.total;
            })
            .addCase(fetchLaws.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createLaw.fulfilled, (state, action) => { state.laws.push(action.payload); })
            .addCase(updateLaw.fulfilled, (state, action) => {
                const index = state.laws.findIndex(l => l.id === action.payload.id);
                if (index !== -1) state.laws[index] = action.payload;
            })
            .addCase(deleteLaw.fulfilled, (state, action) => {
                state.laws = state.laws.filter(l => l.id !== action.payload);
            })

            // Helplines
            .addCase(fetchHelplines.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchHelplines.fulfilled, (state, action) => {
                state.loading = false;
                state.helplines = action.payload.data;
                state.pagination.helplines.total = action.payload.total;
            })
            .addCase(fetchHelplines.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createHelpline.fulfilled, (state, action) => { state.helplines.push(action.payload); })
            .addCase(updateHelpline.fulfilled, (state, action) => {
                const index = state.helplines.findIndex(h => h.id === action.payload.id);
                if (index !== -1) state.helplines[index] = action.payload;
            })
            .addCase(deleteHelpline.fulfilled, (state, action) => {
                state.helplines = state.helplines.filter(h => h.id !== action.payload);
            });
    },
});

export const {
    setCurrentTab,
    setContentPage,
    setContentRowsPerPage,
    clearError
} = contentSlice.actions;

export default contentSlice.reducer;
