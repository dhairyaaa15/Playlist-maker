const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  }

  async generatePlaylistSuggestions(prompt, language, songCount) {
    try {
      const systemPrompt = `You are an expert music curator and DJ with extensive knowledge of music across all genres and languages. Your task is to create personalized playlists based on user requests.

INSTRUCTIONS:
- Generate exactly ${songCount} song suggestions in ${language} language
- Consider the user's mood, occasion, or theme from their prompt
- Include a mix of popular and lesser-known tracks when appropriate
- Ensure songs are actual, real tracks that exist
- Provide variety in artists (don't repeat the same artist too much)
- Match the language requirement strictly

RESPONSE FORMAT (JSON only):
{
  "playlistName": "Creative and engaging playlist name",
  "description": "Brief description explaining the playlist's mood, theme, or purpose",
  "mood": "Overall mood/vibe of the playlist",
  "genre": "Primary genre or style",
  "songs": [
    {
      "name": "Exact song title",
      "artist": "Artist name",
      "mood": "Song's specific mood/energy",
      "reason": "Why this song fits the playlist theme"
    }
  ]
}

USER REQUEST: Create a playlist for "${prompt}" in ${language} with ${songCount} songs.

Respond with valid JSON only, no additional text.`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const content = response.text();

      // Clean the response (remove markdown formatting if present)
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to parse JSON response
      try {
        const parsedResponse = JSON.parse(cleanedContent);
        
        // Validate the response structure
        if (this.validateResponse(parsedResponse, songCount)) {
          return parsedResponse;
        } else {
          console.warn('Gemini response validation failed, using fallback');
          return this.generateFallbackResponse(prompt, language, songCount);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError.message);
        console.log('Raw Gemini response:', content);
        return this.generateFallbackResponse(prompt, language, songCount);
      }

    } catch (error) {
      console.error('Gemini AI Service Error:', error.message);
      return this.generateFallbackResponse(prompt, language, songCount);
    }
  }

  validateResponse(response, expectedSongCount) {
    return (
      response &&
      typeof response === 'object' &&
      response.playlistName &&
      response.description &&
      Array.isArray(response.songs) &&
      response.songs.length <= expectedSongCount + 2 && // Allow slight variation
      response.songs.length >= Math.max(1, expectedSongCount - 2) &&
      response.songs.every(song => 
        song.name && 
        song.artist && 
        typeof song.name === 'string' && 
        typeof song.artist === 'string'
      )
    );
  }

  generateFallbackResponse(prompt, language, songCount) {
    const fallbackSongs = this.generateFallbackSongs(language, songCount);
    
    return {
      playlistName: `${prompt} - ${language} Mix`,
      description: `A curated ${language} playlist inspired by: ${prompt}`,
      mood: this.getMoodFromPrompt(prompt),
      genre: 'Mixed',
      songs: fallbackSongs
    };
  }

  getMoodFromPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('sad') || lowerPrompt.includes('melancholy') || lowerPrompt.includes('rain')) {
      return 'Melancholic';
    } else if (lowerPrompt.includes('happy') || lowerPrompt.includes('upbeat') || lowerPrompt.includes('party')) {
      return 'Upbeat';
    } else if (lowerPrompt.includes('love') || lowerPrompt.includes('romantic')) {
      return 'Romantic';
    } else if (lowerPrompt.includes('workout') || lowerPrompt.includes('gym') || lowerPrompt.includes('energy')) {
      return 'Energetic';
    } else if (lowerPrompt.includes('chill') || lowerPrompt.includes('relax')) {
      return 'Chill';
    } else {
      return 'Mixed';
    }
  }

  generateFallbackSongs(language, count) {
    const fallbackSongs = {
      English: [
        { name: "Shape of You", artist: "Ed Sheeran", mood: "Pop", reason: "Popular upbeat track" },
        { name: "Blinding Lights", artist: "The Weeknd", mood: "Synthpop", reason: "Modern hit with retro vibes" },
        { name: "Watermelon Sugar", artist: "Harry Styles", mood: "Pop Rock", reason: "Feel-good summer vibes" },
        { name: "Levitating", artist: "Dua Lipa", mood: "Dance Pop", reason: "Energetic dance track" },
        { name: "Good 4 U", artist: "Olivia Rodrigo", mood: "Pop Punk", reason: "Catchy alternative pop" },
        { name: "Stay", artist: "The Kid LAROI, Justin Bieber", mood: "Pop", reason: "Contemporary hit" },
        { name: "Heat Waves", artist: "Glass Animals", mood: "Indie Pop", reason: "Dreamy indie vibes" },
        { name: "As It Was", artist: "Harry Styles", mood: "Pop Rock", reason: "Nostalgic modern classic" },
        { name: "Anti-Hero", artist: "Taylor Swift", mood: "Pop", reason: "Introspective pop anthem" },
        { name: "Flowers", artist: "Miley Cyrus", mood: "Pop", reason: "Empowering self-love anthem" },
        { name: "Unholy", artist: "Sam Smith ft. Kim Petras", mood: "Pop", reason: "Bold contemporary sound" },
        { name: "Bad Habit", artist: "Steve Lacy", mood: "R&B", reason: "Smooth R&B groove" },
        { name: "About Damn Time", artist: "Lizzo", mood: "Pop/R&B", reason: "Feel-good confidence booster" },
        { name: "Running Up That Hill", artist: "Kate Bush", mood: "Art Pop", reason: "Timeless artistic expression" },
        { name: "Golden", artist: "Harry Styles", mood: "Pop Rock", reason: "Sunny optimistic track" },
        { name: "Drivers License", artist: "Olivia Rodrigo", mood: "Ballad", reason: "Emotional storytelling" },
        { name: "Industry Baby", artist: "Lil Nas X ft. Jack Harlow", mood: "Hip Hop", reason: "Confident rap anthem" },
        { name: "Peaches", artist: "Justin Bieber", mood: "R&B/Pop", reason: "Smooth contemporary R&B" },
        { name: "Positions", artist: "Ariana Grande", mood: "R&B/Pop", reason: "Sultry modern pop" },
        { name: "Willow", artist: "Taylor Swift", mood: "Folk Pop", reason: "Mystical folk-inspired track" }
      ],
      Hindi: [
        { name: "Kesariya", artist: "Arijit Singh", mood: "Romantic", reason: "Beautiful romantic melody" },
        { name: "Apna Time Aayega", artist: "DIVINE", mood: "Hip Hop", reason: "Motivational rap anthem" },
        { name: "Raabta", artist: "Arijit Singh", mood: "Romantic", reason: "Soulful love song" },
        { name: "Jai Ho", artist: "A.R. Rahman", mood: "Celebratory", reason: "Uplifting celebration song" },
        { name: "Tum Hi Ho", artist: "Arijit Singh", mood: "Romantic", reason: "Emotional ballad" },
        { name: "Khairiyat", artist: "Arijit Singh", mood: "Romantic", reason: "Heartfelt romantic track" },
        { name: "Dil Diyan Gallan", artist: "Atif Aslam", mood: "Romantic", reason: "Melodic love song" },
        { name: "Vaaste", artist: "Dhvani Bhanushali", mood: "Pop", reason: "Modern Hindi pop hit" },
        { name: "Bekhayali", artist: "Sachet Tandon", mood: "Sad", reason: "Emotional heartbreak song" },
        { name: "Kalank", artist: "Arijit Singh", mood: "Dramatic", reason: "Powerful dramatic number" },
        { name: "Malang", artist: "Ved Sharma", mood: "Romantic", reason: "Contemporary romantic track" },
        { name: "Ghungroo", artist: "Arijit Singh, Shilpa Rao", mood: "Upbeat", reason: "Energetic dance number" },
        { name: "Senorita", artist: "Zindagi Na Milegi Dobara", mood: "Fun", reason: "Playful party track" },
        { name: "Nagada Sang Dhol", artist: "Shreya Ghoshal", mood: "Traditional", reason: "Classical fusion piece" },
        { name: "Ae Watan", artist: "Raazi Soundtrack", mood: "Patriotic", reason: "Inspiring patriotic song" },
        { name: "Kabira", artist: "Tochi Raina, Rekha Bhardwaj", mood: "Spiritual", reason: "Soulful spiritual track" },
        { name: "Samjhawan", artist: "Rahat Fateh Ali Khan", mood: "Romantic", reason: "Classic romantic melody" },
        { name: "Bulleya", artist: "Papon", mood: "Sufi", reason: "Mystical Sufi composition" },
        { name: "Ishq Wala Love", artist: "Salim Merchant", mood: "Romantic", reason: "Playful love song" },
        { name: "Kun Faya Kun", artist: "A.R. Rahman", mood: "Spiritual", reason: "Divine spiritual experience" }
      ],
      Gujarati: [
        { name: "Chundadi Jaipur Si", artist: "Kirtidan Gadhvi", mood: "Folk", reason: "Traditional Gujarati folk" },
        { name: "Rangilu Rajula", artist: "Hemant Chauhan", mood: "Devotional", reason: "Spiritual devotional song" },
        { name: "Mari Heeriye", artist: "Sachin-Jigar", mood: "Folk Pop", reason: "Modern Gujarati pop" },
        { name: "Holki Dhol Vage", artist: "Kirtidan Gadhvi", mood: "Festival", reason: "Festive celebration song" },
        { name: "Khodiyar Maa", artist: "Hemant Chauhan", mood: "Devotional", reason: "Popular devotional track" },
        { name: "Tame Aa Jao", artist: "Jigardan Gadhavi", mood: "Romantic", reason: "Modern Gujarati romance" },
        { name: "Morli Gokul Ma", artist: "Hemant Chauhan", mood: "Devotional", reason: "Krishna bhajan" },
        { name: "Dikri Aash Ni", artist: "Kirtidan Gadhvi", mood: "Emotional", reason: "Touching family song" },
        { name: "Ame Gujarati", artist: "Various Artists", mood: "Pride", reason: "Gujarati pride anthem" },
        { name: "Sanedo", artist: "Traditional", mood: "Folk", reason: "Classic Gujarati folk dance" },
        { name: "Tara Vina Shyam", artist: "Hemant Chauhan", mood: "Devotional", reason: "Beautiful Krishna song" },
        { name: "Radha Ne Shyam", artist: "Jigardan Gadhavi", mood: "Devotional", reason: "Radha-Krishna love song" },
        { name: "Gujarati Garba", artist: "Falguni Pathak", mood: "Festival", reason: "Traditional garba song" },
        { name: "Meldi Maa", artist: "Hemant Chauhan", mood: "Devotional", reason: "Goddess devotional song" },
        { name: "Jogni Jogan", artist: "Traditional", mood: "Folk", reason: "Traditional folk narrative" },
        { name: "Bhathiji Maharaj", artist: "Hemant Chauhan", mood: "Devotional", reason: "Regional deity song" },
        { name: "Ambaji Maa", artist: "Various Artists", mood: "Devotional", reason: "Goddess Amba prayer" },
        { name: "Kutch Ma Kyarek", artist: "Regional Artists", mood: "Folk", reason: "Kutchi folk song" },
        { name: "Navratri Special", artist: "Falguni Pathak", mood: "Festival", reason: "Nine nights celebration" },
        { name: "Gujarat Ni Aasmani", artist: "Kirtidan Gadhvi", mood: "Pride", reason: "Gujarat tribute song" }
      ]
    };

    const songs = fallbackSongs[language] || fallbackSongs.English;
    const selectedSongs = [];
    const availableSongs = [...songs];
    
    // Randomly select songs to avoid repetition
    for (let i = 0; i < Math.min(count, availableSongs.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      selectedSongs.push(availableSongs[randomIndex]);
      availableSongs.splice(randomIndex, 1);
    }
    
    return selectedSongs;
  }

  // Method to get creative playlist suggestions based on prompt analysis
  async getPlaylistSuggestions(prompt, language) {
    try {
      const suggestionPrompt = `Based on the user prompt "${prompt}", suggest 3 creative playlist names and themes in ${language}. 
      
      Respond in JSON format:
      {
        "suggestions": [
          {
            "name": "Playlist Name",
            "theme": "Brief theme description",
            "mood": "Overall mood"
          }
        ]
      }`;

      const result = await this.model.generateContent(suggestionPrompt);
      const response = await result.response;
      const content = response.text();

      try {
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        return {
          suggestions: [
            { name: `${prompt} Mix`, theme: "Based on your request", mood: "Varied" },
            { name: `${language} Vibes`, theme: "Language-specific selection", mood: "Cultural" },
            { name: "AI Curated", theme: "Algorithmically selected", mood: "Diverse" }
          ]
        };
      }
    } catch (error) {
      console.error('Playlist suggestions error:', error.message);
      return {
        suggestions: [
          { name: `${prompt} Playlist`, theme: "Custom playlist", mood: "Mixed" }
        ]
      };
    }
  }
}

module.exports = new AIService();