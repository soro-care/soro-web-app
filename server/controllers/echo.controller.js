import Echo from "../models/echo.model.js";
import RoomStats from "../models/roomStats.model.js";


// Blocked keywords - Expanded
const BLOCKED_KEYWORDS = [
    'kill you', 
];

// Emotion detection
const EMOTION_MAP = {
    pressure: ['stress', 'exam', 'test', 'deadline', 'pressure', 'anxious'],
    burnout: ['exhausted', 'tired', 'burnout', 'drained', 'empty'],
    gratitude: ['thankful', 'grateful', 'appreciate', 'blessed', 'lucky'],
    hope: ['hope', 'better', 'improving', 'progress', 'light'],
    rage: ['angry', 'furious', 'mad', 'rage', 'frustrated', 'pissed', 'irritated', 'annoyed', 'livid']
};

// Update the CRISIS_KEYWORDS array in echo.controller.js
const CRISIS_KEYWORDS = [
    // Suicide/depression related - EXPANDED LIST
    'suicide', 'kill myself', 'end it all', 'want to die', 'want to end it',
    'no reason to live', 'can\'t go on', 'giving up', 'end my life',
    'taking my life', 'end everything', 'no will to live', 'better off dead',
    'don\'t want to live', 'life is worthless', 'end this pain',
    'i want to kill myself', 'i want to end it all', 'i want to die',
    'want to kill myself', 'wanna die', 'wanna kill myself',
    'should i kill myself', 'thinking of suicide', 'suicidal thoughts',
    'end my suffering', 'make it stop', 'cant take this anymore',
    'cant live like this', 'tired of living', 'hate my life',
    
    // Self-harm related
    'hurt myself', 'self harm', 'cutting', 'burning myself', 'self injury',
    'cut myself', 'harm myself', 'self-harm',
    
    // Extreme distress
    'can\'t take it anymore', 'breaking point', 'mental breakdown',
    'losing my mind', 'going crazy', 'complete hopelessness',
    'helpless', 'desperate', 'in despair', 'overwhelmed',
    
    // Specific methods
    'overdose', 'jump off', 'hang myself', 'shoot myself', 'poison',
    'pills', 'jump from', 'hang myself', 'jump in front of',
    
    // Emergency phrases
    'need help now', 'emergency', 'urgent help', 'immediate danger',
    'can\'t cope', 'losing control', 'help me', 'save me',
    
    // Hopelessness
    'nothing matters', 'pointless', 'useless', 'worthless', 'hopeless',
    'nothing will get better', 'never get better', 'always be like this'
];

export const createEcho = async (req, res) => {
    try {
        const { content, room, authorName } = req.body;

        // Validation checks - REQUIRED FIELDS
        if (!content || !room || !authorName) {
            return res.status(400).json({
                message: "Content, room, and display name are required",
                error: true,
                success: false
            });
        }

        // Validate author name
        const trimmedAuthorName = authorName.trim();
        if (trimmedAuthorName.length < 2) {
            return res.status(400).json({
                message: "Display name must be at least 2 characters",
                error: true,
                success: false
            });
        }

        if (trimmedAuthorName.length > 30) {
            return res.status(400).json({
                message: "Display name cannot exceed 30 characters",
                error: true,
                success: false
            });
        }

        // Check for invalid characters in author name
        const invalidChars = /[<>{}[\]\\]/;
        if (invalidChars.test(trimmedAuthorName)) {
            return res.status(400).json({
                message: "Display name contains invalid characters",
                error: true,
                success: false
            });
        }

        // Check content length
        if (content.length < 10) {
            return res.status(400).json({
                message: "Please share a bit more (at least 10 characters)",
                error: true,
                success: false
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                message: "Story cannot exceed 2000 characters",
                error: true,
                success: false
            });
        }

        // Content moderation
        const lowerContent = content.toLowerCase().trim();
        
        // CRISIS DETECTION - IMPROVED
        let hasCrisis = false;
        
        // Check for exact phrases and word combinations
        for (const keyword of CRISIS_KEYWORDS) {
            // Check for exact phrase matches
            if (lowerContent.includes(keyword.toLowerCase())) {
                console.log(`Crisis detected with keyword: "${keyword}" in content: "${content.substring(0, 50)}..." by "${trimmedAuthorName}"`);
                hasCrisis = true;
                break;
            }
            
            // Also check for keyword variations with "I want to" prefix
            if (keyword.includes('kill myself') || keyword.includes('end it all')) {
                // Check for "I want to [keyword]" pattern
                const variations = [
                    `i want to ${keyword}`,
                    `i wanna ${keyword}`,
                    `i need to ${keyword}`,
                    `i have to ${keyword}`,
                    `i'm going to ${keyword}`
                ];
                
                for (const variation of variations) {
                    if (lowerContent.includes(variation)) {
                        console.log(`Crisis detected with variation: "${variation}" by "${trimmedAuthorName}"`);
                        hasCrisis = true;
                        break;
                    }
                }
            }
            
            if (hasCrisis) break;
        }

        // BLOCKED CONTENT DETECTION
        let hasBlocked = false;
        for (const keyword of BLOCKED_KEYWORDS) {
            if (lowerContent.includes(keyword.toLowerCase())) {
                console.log(`Blocked content detected with keyword: ${keyword} by "${trimmedAuthorName}"`);
                hasBlocked = true;
                break;
            }
        }

        if (hasBlocked) {
            return res.status(400).json({
                message: "This content cannot be shared due to our safety guidelines",
                error: true,
                success: false
            });
        }

        // Determine sentiment based on room
        let sentiment = "neutral";
        if (['pressure', 'burnout', 'not-enough', 'silence', 'rage', 'exhaustion'].includes(room)) {
            sentiment = "struggle";
        } else if (['gratitude', 'victory', 'hope', 'resilience'].includes(room)) {
            sentiment = "positive";
        }

        // Extract emotion tags
        const emotionTags = [];
        for (const [emotion, keywords] of Object.entries(EMOTION_MAP)) {
            for (const keyword of keywords) {
                if (lowerContent.includes(keyword)) {
                    emotionTags.push(emotion);
                    break; // Only add emotion once
                }
            }
        }

        // Calculate word count
        const wordCount = content.trim().split(/\s+/).length;

        // Create the echo with author name
        const newEcho = new Echo({
            content,
            room,
            authorName: trimmedAuthorName,
            sentiment,
            emotionTags: emotionTags.length > 0 ? emotionTags : [sentiment],
            crisisFlag: hasCrisis,
            moderated: true,
            wordCount: wordCount
        });

        // Save the echo to database
        const savedEcho = await newEcho.save();

        // Update room statistics
        await RoomStats.incrementCount(room);

        // Prepare response data - include ALL fields frontend needs
        const responseData = {
            _id: savedEcho._id,
            content: savedEcho.content,
            room: savedEcho.room,
            authorName: savedEcho.authorName,
            createdAt: savedEcho.createdAt,
            wordCount: savedEcho.wordCount,
            likesCount: 0,
            likes: [],
            userHasLiked: false,
            shareCount: 0,
            comments: [],
            emotionTags: savedEcho.emotionTags,
            sentiment: savedEcho.sentiment,
            crisisFlag: savedEcho.crisisFlag,
            crisis: hasCrisis
        };

        // If crisis detected, add resources to response
        if (hasCrisis) {
            console.log('Crisis detected - returning resources for content:', content.substring(0, 100), 'by', trimmedAuthorName);
            responseData.resources = [
                "SURPIN Crisis Line: +2349034400009",
                "MANI Support Line: 08091116264",
                "National Suicide Prevention Lifeline: 1-800-273-8255",
                "Crisis Text Line: Text HOME to 741741",
                "Immediate help: Go to the nearest emergency room or call emergency services"
            ];
            
            return res.status(201).json({
                success: true,
                message: "Your story has been shared. Help is available if you need it.",
                data: responseData
            });
        }

        // Normal story response
        return res.status(201).json({
            success: true,
            message: "Story shared successfully. You've helped someone feel less alone.",
            data: responseData
        });

    } catch (error) {
        console.error('Error creating echo:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: true
        });
    }
};

// In echo.controller.js - Update likeEcho function
export const likeEcho = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { authorName } = req.body; // Get authorName from request body
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const echo = await Echo.findById(storyId);
        
        if (!echo) {
            return res.status(404).json({
                message: "Story not found",
                error: true,
                success: false
            });
        }

        // Check if this IP has already liked this story
        const alreadyLiked = echo.likes.some(like => like.ipAddress === ipAddress);
        
        if (alreadyLiked) {
            // Remove like
            echo.likes = echo.likes.filter(like => like.ipAddress !== ipAddress);
        } else {
            // Add like
            echo.likes.push({
                ipAddress,
                userAgent,
                likedAt: new Date(),
                authorName: authorName || 'Anonymous' // Save authorName with like
            });
        }

        await echo.save();

        return res.json({
            message: alreadyLiked ? "Like removed" : "Liked successfully",
            data: {
                storyId: echo._id,
                likesCount: echo.likes.length,
                userHasLiked: !alreadyLiked
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error liking story:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// Update trackShare function
export const trackShare = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { platform, authorName } = req.body; // Get authorName from request body

        const echo = await Echo.findById(storyId);
        
        if (!echo) {
            return res.status(404).json({
                message: "Story not found",
                error: true,
                success: false
            });
        }

        // Increment share count
        echo.shareCount += 1;
        
        // Log the share
        echo.shareLogs.push({
            platform: platform || 'unknown',
            sharedAt: new Date(),
            authorName: authorName || 'Anonymous' // Save authorName with share
        });

        await echo.save();

        return res.json({
            message: "Share tracked successfully",
            data: {
                storyId: echo._id,
                shareCount: echo.shareCount
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error tracking share:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

export const getEchoesByRoom = async (req, res) => {
    try {
        const { room } = req.params;
        const { page = 1, limit = 50, sort = 'newest', includeCrisis = 'true' } = req.query;
        const clientIp = req.ip || req.connection.remoteAddress;

        const skip = (page - 1) * limit;

        // Build sort object
        let sortObj = { createdAt: -1 };
        if (sort === 'popular') {
            sortObj = { likes: -1 };
        }

        const filter = { 
            room: room,
            isArchived: false,
            moderated: true
        };
        
        if (includeCrisis === 'false') {
            filter.crisisFlag = false;
        }

        const [echoes, totalCount, roomStats] = await Promise.all([
            Echo.find(filter)
                .select('content createdAt emotionTags wordCount crisisFlag room moderated likes shareCount shareLogs authorName comments')
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            Echo.countDocuments(filter),
            RoomStats.findOne({ roomId: room })
        ]);

        // Add user's like status and comment count to each echo
        const echoesWithLikeStatus = echoes.map(echo => ({
            ...echo,
            likesCount: echo.likes ? echo.likes.length : 0,
            userHasLiked: echo.likes ? echo.likes.some(like => like.ipAddress === clientIp) : false,
            shareCount: echo.shareCount || 0,
            commentCount: echo.comments ? echo.comments.length : 0, // Add comment count
            authorName: echo.authorName || 'Anonymous'
        }));

        return res.json({
            message: "Stories retrieved successfully",
            data: {
                echoes: echoesWithLikeStatus,
                stats: roomStats || {
                    totalStories: totalCount,
                    todaysStories: 0
                },
                pagination: {
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit),
                    current: parseInt(page),
                    limit: parseInt(limit)
                }
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error fetching echoes:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};
// Updated getEchoById function
export const getEchoById = async (req, res) => {
    try {
        const { storyId } = req.params;
        const clientIp = req.ip || req.connection.remoteAddress;

        const echo = await Echo.findById(storyId)
            .select('content createdAt emotionTags wordCount crisisFlag room moderated likes shareCount shareLogs authorName') // Added authorName here
            .lean();

        if (!echo) {
            return res.status(404).json({
                message: "Story not found",
                error: true,
                success: false
            });
        }

        const echoWithLikeStatus = {
            ...echo,
            likesCount: echo.likes ? echo.likes.length : 0,
            userHasLiked: echo.likes ? echo.likes.some(like => like.ipAddress === clientIp) : false,
            shareCount: echo.shareCount || 0,
            authorName: echo.authorName || 'Anonymous' // Ensure authorName is included
        };

        return res.json({
            message: "Story retrieved successfully",
            data: echoWithLikeStatus,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error fetching story:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// New endpoint for related stories
export const getRelatedStories = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 3, exclude } = req.query;
        const clientIp = req.ip || req.connection.remoteAddress;

        const filter = { 
            room: roomId,
            isArchived: false,
            moderated: true
        };

        // Exclude specific story if provided
        if (exclude) {
            filter._id = { $ne: exclude };
        }

        const echoes = await Echo.find(filter)
            .select('content createdAt authorName likes')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        // Add user's like status to each echo
        const echoesWithLikeStatus = echoes.map(echo => ({
            ...echo,
            likesCount: echo.likes ? echo.likes.length : 0,
            userHasLiked: echo.likes ? echo.likes.some(like => like.ipAddress === clientIp) : false,
            authorName: echo.authorName || 'Anonymous'
        }));

        return res.json({
            message: "Related stories retrieved successfully",
            data: {
                echoes: echoesWithLikeStatus
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error fetching related stories:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

export const getRoomsStats = async (req, res) => {
    try {
        const allStats = await RoomStats.find({});

        // Calculate overall stats
        const totalStories = allStats.reduce((sum, stat) => sum + stat.totalStories, 0);
        const totalToday = allStats.reduce((sum, stat) => sum + stat.todaysStories, 0);

        return res.json({
            message: "Room statistics retrieved",
            data: {
                rooms: allStats,
                overall: {
                    totalStories,
                    todaysStories: totalToday,
                    totalRooms: allStats.length
                }
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error fetching room stats:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

export const searchEchoes = async (req, res) => {
    try {
        const { query, room, page = 1, limit = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                message: "Search query is required",
                error: true,
                success: false
            });
        }

        const skip = (page - 1) * limit;

        const searchFilter = {
            $text: { $search: query },
            moderated: true,
            isArchived: false,
            crisisFlag: false
        };

        if (room && room !== 'all') {
            searchFilter.room = room;
        }

        const [echoes, totalCount] = await Promise.all([
            Echo.find(searchFilter)
                .select('content createdAt room emotionTags')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Echo.countDocuments(searchFilter)
        ]);

        return res.json({
            message: "Search results",
            data: echoes,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                current: parseInt(page),
                limit: parseInt(limit)
            },
            error: false,
            success: false
        });

    } catch (error) {
        console.error('Error searching echoes:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};

// Admin endpoints
export const moderateEcho = async (req, res) => {
    try {
        const { echoId, action } = req.body;

        if (!echoId || !action) {
            return res.status(400).json({
                message: "Echo ID and action are required",
                error: true,
                success: false
            });
        }

        let update = {};
        switch (action) {
            case 'approve':
                update = { moderated: true };
                break;
            case 'archive':
                update = { isArchived: true };
                break;
            case 'flag':
                update = { crisisFlag: true };
                break;
            default:
                return res.status(400).json({
                    message: "Invalid action",
                    error: true,
                    success: false
                });
        }

        const updated = await Echo.findByIdAndUpdate(
            echoId,
            update,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Story not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: `Story ${action}d successfully`,
            data: updated,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error moderating echo:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: true,
            success: false
        });
    }
};


export const addComment = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { content, username } = req.body;
    const commenterId = req.headers['x-anon-user-id'];

    // Validation - ALL FIELDS REQUIRED
    if (!content || content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 3 characters"
      });
    }

    if (!username || username.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Display name is required (min 2 characters)"
      });
    }

    if (username.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Display name cannot exceed 30 characters"
      });
    }

    // Check for invalid characters in username
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(username.trim())) {
      return res.status(400).json({
        success: false,
        message: "Display name contains invalid characters"
      });
    }

    if (!commenterId) {
      return res.status(400).json({
        success: false,
        message: "User identifier required"
      });
    }

    const echo = await Echo.findById(storyId);
    if (!echo) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    const newComment = {
      content: content.trim(),
      username: username.trim(), // REQUIRED - trimmed
      commenterId: commenterId,
      createdAt: new Date()
    };

    // Use $push to add comment without validating entire document
    const updatedEcho = await Echo.findByIdAndUpdate(
      storyId,
      {
        $push: {
          comments: newComment
        }
      },
      {
        new: true, // Return the updated document
        runValidators: false, // Don't run validators on the entire document
        select: 'comments' // Only return comments field
      }
    ).lean();

    // Get the newly added comment (last one in array)
    const addedComment = updatedEcho.comments[updatedEcho.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        _id: addedComment._id,
        content: addedComment.content,
        username: addedComment.username,
        createdAt: addedComment.createdAt,
        isMine: true // Since the user just added it
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { storyId } = req.params;
    const clientUserId = req.headers['x-anon-user-id'];

    if (!clientUserId) {
      return res.status(400).json({
        success: false,
        message: "User identifier required"
      });
    }

    const echo = await Echo.findById(storyId)
      .select('comments')
      .lean();

    if (!echo) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }

    // Check if comments exist, default to empty array if not
    const comments = echo.comments || [];

    // Format comments to hide commenterId for privacy
    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      username: comment.username || 'Anonymous',
      createdAt: comment.createdAt,
      isMine: comment.commenterId === clientUserId
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      message: "Comments retrieved successfully",
      data: formattedComments
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};