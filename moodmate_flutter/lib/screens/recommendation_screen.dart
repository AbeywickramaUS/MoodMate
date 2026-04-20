import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/features.dart';
import '../data/activities.dart';
import '../utils/recommendation_engine.dart';
import '../utils/song_service.dart';
import '../utils/activity_service.dart';
import '../data/songs.dart';

class RecommendationScreen extends StatefulWidget {
  final String mood;
  final String location;
  const RecommendationScreen({Key? key, required this.mood, required this.location}) : super(key: key);

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  String recommendation = '';
  List<String> rejectedRecommendations = [];
  bool accepted = false;
  List<Song> suggestedSongs = [];
  bool showSongs = false;
  List<Activity> suggestedActivities = [];
  String selectedCategory = 'all';

  MoodOption? get moodData => MOODS.cast<MoodOption?>().firstWhere((m) => m!.id == widget.mood, orElse: () => null);
  LocationOption? get locationData => LOCATIONS.cast<LocationOption?>().firstWhere((l) => l!.id == widget.location, orElse: () => null);

  @override
  void initState() {
    super.initState();
    _generateRecommendation();
    _generateActivities();
  }

  void _generateActivities() {
    final state = Provider.of<AppState>(context, listen: false);
    final activities = getSuggestedActivities(
      mood: widget.mood,
      location: widget.location,
      timePeriod: getCurrentTimePeriod(),
      allergies: state.userProfile.allergies,
      maxPerCategory: 3,
      maxTotal: 12,
    );
    setState(() => suggestedActivities = activities);
  }

  void _generateRecommendation() {
    final state = Provider.of<AppState>(context, listen: false);
    final context2 = UserContext(
      mood: widget.mood,
      time: getCurrentTimePeriod(),
      dayOfWeek: DateTime.now().weekday % 7,
      location: widget.location,
      allergies: state.userProfile.allergies,
      userGoal: state.userProfile.preferredGoal,
    );

    final rec = rejectedRecommendations.isNotEmpty
        ? getAlternativeRecommendation(context2, rejectedRecommendations)
        : getRecommendation(context2);

    setState(() {
      recommendation = rec;
      if (isMusicRecommendation(rec)) {
        showSongs = true;
        suggestedSongs = getSongsForMood(widget.mood, count: 3);
      } else {
        showSongs = false;
        suggestedSongs = [];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          Positioned(top: -40, right: -40, child: Container(width: 160, height: 160, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF8B5CF6).withOpacity(0.12)))),
          Positioned(top: 100, left: -60, child: Container(width: 180, height: 180, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF3B82F6).withOpacity(0.08)))),

          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                const Padding(
                  padding: EdgeInsets.fromLTRB(24, 60, 24, 0),
                  child: Column(
                    children: [
                      Text('Your Recommendations', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white), textAlign: TextAlign.center),
                      SizedBox(height: 6),
                      Text('Based on your current state', style: TextStyle(fontSize: 15, color: Color(0xFF94A3B8)), textAlign: TextAlign.center),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Context Summary
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(child: _ContextCard(emoji: moodData?.emoji ?? '❓', label: moodData?.label ?? '')),
                      const SizedBox(width: 12),
                      Expanded(child: _ContextCard(emoji: locationData?.icon ?? '📍', label: 'At ${locationData?.label ?? "Unknown"}')),
                    ],
                  ),
                ),

                // Risk Badge
                if (state.currentRiskLevel == 'high') ...[
                  const SizedBox(height: 16),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                    ),
                    child: const Text('⚠️ Special Recommendation - High-Risk Week', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFFCA5A5))),
                  ),
                ],

                // Recommendation Card
                const SizedBox(height: 16),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFA855F7), width: 2),
                    boxShadow: [BoxShadow(color: const Color(0xFFA855F7).withOpacity(0.2), blurRadius: 16)],
                  ),
                  child: Column(
                    children: [
                      const Text('💡', style: TextStyle(fontSize: 48), textAlign: TextAlign.center),
                      const SizedBox(height: 16),
                      Text(recommendation, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Color(0xFFE2E8F0), height: 1.6)),
                      const SizedBox(height: 24),
                      if (!accepted)
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  setState(() => rejectedRecommendations.add(recommendation));
                                  _generateRecommendation();
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF334155),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: Color(0xFF475569))),
                                ),
                                child: const Text('🔄 Try Another', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => setState(() => accepted = true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF22C55E),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 4,
                                  shadowColor: const Color(0xFF22C55E).withOpacity(0.3),
                                ),
                                child: const Text('✅ Accept', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                              ),
                            ),
                          ],
                        )
                      else
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF22C55E).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.3)),
                          ),
                          child: const Text('✨ Great choice! Enjoy your activity!', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF4ADE80), fontSize: 16, fontWeight: FontWeight.w500)),
                        ),
                    ],
                  ),
                ),

                // Song Recommendations
                if (showSongs && suggestedSongs.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🎵 Suggested Songs', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                        const SizedBox(height: 4),
                        Text('Based on your ${moodData?.label.toLowerCase() ?? ""} mood', style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                        const SizedBox(height: 14),
                        ...suggestedSongs.map((song) => Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFF2D3A52)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: const Color(0xFF8B5CF6).withOpacity(0.15)),
                                child: const Center(child: Text('🎵', style: TextStyle(fontSize: 22))),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(song.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                                    const SizedBox(height: 2),
                                    Text(song.artist, style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFA855F7).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
                                ),
                                child: Text(song.genre, style: const TextStyle(fontSize: 11, color: Color(0xFFA78BFA), fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                        )),
                      ],
                    ),
                  ),
                ],

                // Alternatives count
                if (rejectedRecommendations.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      '${rejectedRecommendations.length} alternative${rejectedRecommendations.length > 1 ? "s" : ""} tried',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
                    ),
                  ),

                // Activities Section
                if (suggestedActivities.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🎯 Suggested Activities', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
                        const SizedBox(height: 4),
                        Text('Based on your ${moodData?.label.toLowerCase() ?? ""} mood at ${locationData?.label.toLowerCase() ?? ""}', style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                        const SizedBox(height: 16),

                        // Category Filter
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _CategoryPill(label: 'All', isActive: selectedCategory == 'all', onTap: () => setState(() => selectedCategory = 'all')),
                              const SizedBox(width: 8),
                              ...ACTIVITY_CATEGORIES.map((cat) {
                                final count = suggestedActivities.where((a) => a.category == cat.id).length;
                                if (count == 0) return const SizedBox.shrink();
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: _CategoryPill(
                                    label: '${cat.icon} ${cat.label}',
                                    isActive: selectedCategory == cat.id,
                                    count: count,
                                    color: cat.color,
                                    onTap: () => setState(() => selectedCategory = cat.id),
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Activity Cards
                        ...suggestedActivities
                            .where((a) => selectedCategory == 'all' || a.category == selectedCategory)
                            .map((activity) {
                          final catData = ACTIVITY_CATEGORIES.cast<ActivityCategoryInfo?>().firstWhere((c) => c!.id == activity.category, orElse: () => null);
                          final catColor = catData != null ? Color(hexToColor(catData.color)) : const Color(0xFFA855F7);
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFF2D3A52)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 50, height: 50,
                                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), color: catColor.withOpacity(0.1)),
                                  child: Center(child: Text(activity.icon, style: const TextStyle(fontSize: 24))),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(activity.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                                      const SizedBox(height: 3),
                                      Text(activity.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), height: 1.4)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(color: const Color(0xFF94A3B8).withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                                            child: Text('⏱ ${activity.duration}', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(color: catColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                            child: Text(catData?.label ?? '', style: TextStyle(fontSize: 11, color: catColor, fontWeight: FontWeight.w600)),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],

                // Return Home
                const SizedBox(height: 24),
                GestureDetector(
                  onTap: () => Navigator.of(context).popUntil((route) => route.isFirst),
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('← Return Home', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16, fontWeight: FontWeight.w500)),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ContextCard extends StatelessWidget {
  final String emoji;
  final String label;
  const _ContextCard({required this.emoji, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2D3A52)),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 48)),
          const SizedBox(height: 8),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  final String label;
  final bool isActive;
  final int? count;
  final String? color;
  final VoidCallback onTap;
  const _CategoryPill({required this.label, required this.isActive, this.count, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final pillColor = color != null ? Color(hexToColor(color!)) : const Color(0xFFA855F7);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? pillColor.withOpacity(0.15) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isActive ? pillColor.withOpacity(0.4) : const Color(0xFF2D3A52)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(label, style: TextStyle(fontSize: 13, color: isActive ? pillColor : const Color(0xFF94A3B8), fontWeight: FontWeight.w600)),
            if (count != null) ...[
              const SizedBox(width: 6),
              Container(
                width: 20, height: 20,
                decoration: BoxDecoration(shape: BoxShape.circle, color: pillColor.withOpacity(0.2)),
                child: Center(child: Text('$count', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pillColor))),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
