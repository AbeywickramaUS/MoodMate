import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/features.dart';
import '../utils/recommendation_engine.dart';

class TrendsScreen extends StatelessWidget {
  const TrendsScreen({Key? key}) : super(key: key);

  Color _getRiskColor(String riskLevel) {
    switch (riskLevel) {
      case 'high': return const Color(0xFFEF4444);
      case 'improving': return const Color(0xFF22C55E);
      default: return const Color(0xFF3B82F6);
    }
  }

  String _getRiskTitle(String riskLevel) {
    switch (riskLevel) {
      case 'high': return '⚠ High Risk';
      case 'improving': return '📈 Improving';
      default: return '✨ Stable';
    }
  }

  String _getRiskDescription(String riskLevel) {
    switch (riskLevel) {
      case 'high':
        return 'Your mood patterns indicate elevated stress. We recommend focusing on calming activities this week.';
      case 'improving':
        return 'Great progress! Your mood has been improving over the past few days. Keep up the positive momentum!';
      default:
        return 'Your mood patterns are stable. Continue your current wellness practices.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final weeklyStats = getWeeklyStats(state.moodHistory);
    final moodCounts = weeklyStats['moodCounts'] as Map<String, int>;
    final total = weeklyStats['total'] as int;
    final riskColor = _getRiskColor(state.currentRiskLevel);

    final maxMoodCount = max(moodCounts.values.fold(0, (a, b) => max(a, b)), 1);
    final happyPercentage = total > 0 ? ((moodCounts['happy'] ?? 0) / total * 100).round() : 0;
    final happyMood = MOODS.cast<MoodOption?>().firstWhere((m) => m!.id == 'happy', orElse: () => null);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            const Padding(
              padding: EdgeInsets.fromLTRB(24, 60, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Your Trends', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
                  SizedBox(height: 4),
                  Text('Weekly mood analysis', style: TextStyle(fontSize: 15, color: Color(0xFF94A3B8))),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Risk Status Card
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: state.currentRiskLevel == 'high'
                    ? const Color(0xFFEF4444).withOpacity(0.12)
                    : state.currentRiskLevel == 'improving'
                        ? const Color(0xFF22C55E).withOpacity(0.12)
                        : const Color(0xFF3B82F6).withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: riskColor, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_getRiskTitle(state.currentRiskLevel), style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: riskColor)),
                  const SizedBox(height: 8),
                  Text(_getRiskDescription(state.currentRiskLevel), style: const TextStyle(fontSize: 14, color: Color(0xFFCBD5E1), height: 1.4)),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Summary Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF2D3A52)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Past 7 Days', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8))),
                              const Text('📊', style: TextStyle(fontSize: 20)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text('$total', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white)),
                          const SizedBox(height: 4),
                          const Text('Total Logs', style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFA855F7).withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('$happyPercentage%', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8))),
                              Text(happyMood?.emoji ?? '😊', style: const TextStyle(fontSize: 20)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text('', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white)),
                          const SizedBox(height: 4),
                          const Text('Happy', style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Mood Distribution
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF2D3A52)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Mood Distribution', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 18),
                  ...MOODS.map((mood) {
                    final count = moodCounts[mood.id] ?? 0;
                    final color = Color(hexToColor(mood.color));
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Row(
                        children: [
                          Text(mood.emoji, style: const TextStyle(fontSize: 20)),
                          const SizedBox(width: 4),
                          SizedBox(
                            width: 100,
                            child: Text(mood.label, style: const TextStyle(fontSize: 14, color: Color(0xFFCBD5E1), fontWeight: FontWeight.w500)),
                          ),
                          Expanded(
                            child: Container(
                              height: 14,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A),
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: Row(
                                children: List.generate(count, (i) => Container(
                                  width: 18, height: 10,
                                  margin: const EdgeInsets.symmetric(horizontal: 1),
                                  decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
                                )),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 30,
                            child: Text('$count', textAlign: TextAlign.right, style: const TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Recent Activity
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF2D3A52)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Recent Activity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 18),
                  if (state.moodHistory.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Text('No mood entries yet. Start logging to see your patterns!', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
                    )
                  else
                    ...state.moodHistory.reversed.take(7).map((entry) {
                      final moodData = MOODS.cast<MoodOption?>().firstWhere((m) => m!.id == entry.mood, orElse: () => null);
                      final date = DateTime.fromMillisecondsSinceEpoch(entry.timestamp);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Text(moodData?.emoji ?? '❓', style: const TextStyle(fontSize: 28)),
                            const SizedBox(width: 14),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(moodData?.label ?? 'Unknown', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                                const SizedBox(height: 3),
                                Text(
                                  '${date.day}/${date.month}/${date.year} at ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
