import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/features.dart';
import '../main.dart';
import 'mood_input_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning! 👋';
    if (hour < 17) return 'Good Afternoon! 👋';
    return 'Good Evening! 👋';
  }

  Color _getRiskColor(String riskLevel) {
    switch (riskLevel) {
      case 'high': return const Color(0xFFEF4444);
      case 'improving': return const Color(0xFF22C55E);
      default: return const Color(0xFF3B82F6);
    }
  }

  String _getRiskText(String riskLevel) {
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'improving': return 'Improving';
      default: return 'Stable';
    }
  }

  String _getRiskDescription(String riskLevel) {
    switch (riskLevel) {
      case 'high': return 'Learn more about managing this status.';
      case 'improving': return 'Great progress on your wellness journey!';
      default: return 'Your mood is looking stable.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final riskColor = _getRiskColor(state.currentRiskLevel);

    final todayEntries = state.moodHistory.where((m) {
      final entryDate = DateTime.fromMillisecondsSinceEpoch(m.timestamp);
      final today = DateTime.now();
      return entryDate.year == today.year && entryDate.month == today.month && entryDate.day == today.day;
    }).length;

    MoodOption? lastMood;
    if (state.moodHistory.isNotEmpty) {
      final last = state.moodHistory.last;
      lastMood = MOODS.cast<MoodOption?>().firstWhere((m) => m!.id == last.mood, orElse: () => null);
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          // Ambient glow effects
          Positioned(top: -60, left: -40, child: Container(width: 200, height: 200, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF8B5CF6).withOpacity(0.15)))),
          Positioned(top: -30, right: -60, child: Container(width: 180, height: 180, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF3B82F6).withOpacity(0.1)))),
          Positioned(top: 40, left: MediaQuery.of(context).size.width / 3, child: Container(width: 120, height: 120, decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF22C55E).withOpacity(0.08)))),

          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 60, 24, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_getGreeting(), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 4),
                        const Text('How are you feeling today?', style: TextStyle(fontSize: 16, color: Color(0xFF94A3B8))),
                        
                        // DEBUG ROW
                        Container(
                          margin: const EdgeInsets.only(top: 8),
                          padding: const EdgeInsets.all(4),
                          color: Colors.red.withOpacity(0.5),
                          child: Text(
                            'DEBUG: Perm:${state.hasLocationPermission} GPS:${state.isLocationServiceEnabled} Loc:${state.currentLocation}',
                            style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),

                        if (state.hasLocationPermission && state.isLocationServiceEnabled && !state.isLocationLoading) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text('📍 ', style: TextStyle(fontSize: 12)),
                                Text(
                                  'Currently at ${LOCATIONS.firstWhere((l) => l.id == state.currentLocation, orElse: () => LOCATIONS[0]).label}',
                                  style: const TextStyle(color: Color(0xFFA78BFA), fontSize: 13, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ] else if (!state.isLocationServiceEnabled) ...[
                          const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () => state.openLocationSettings(),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEF4444).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.location_off, color: Color(0xFFEF4444), size: 16),
                                  SizedBox(width: 8),
                                  Text('GPS is disabled. Tap to enable.', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13, fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ),
                          ),
                        ] else if (!state.hasLocationPermission) ...[
                          const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () => state.requestPermission(),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFF59E0B).withOpacity(0.5)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.security, color: Color(0xFFF59E0B), size: 16),
                                  SizedBox(width: 8),
                                  Text('Location permission required. Tap to grant.', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 13, fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ),
                          ),
                        ] else if (state.isLocationLoading) ...[
                          const SizedBox(height: 12),
                          const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFA78BFA))),
                              SizedBox(width: 8),
                              Text('Detecting location...', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Dashboard Card
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF2D3A52)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Health & Mood Dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                        const SizedBox(height: 16),

                        // Risk Status
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: riskColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: riskColor, width: 1.5),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Text('⚠️', style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 10),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Current Status:', style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                                      Text(_getRiskText(state.currentRiskLevel), style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: riskColor)),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(_getRiskDescription(state.currentRiskLevel), style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8), height: 1.4)),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Dashboard Stats
                        const Text('Dashboard Stats', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF94A3B8))),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _GaugeWidget(value: todayEntries, label: 'Logs Today'),
                            _GaugeWidget(value: state.moodHistory.length, label: 'Total Logs'),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Last Mood
                  if (lastMood != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF2D3A52)),
                      ),
                      child: Row(
                        children: [
                          Text(lastMood.emoji, style: const TextStyle(fontSize: 40)),
                          const SizedBox(width: 14),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Last Recorded Mood', style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8))),
                              const SizedBox(height: 2),
                              Text(lastMood.label, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Log Mood Button
                  const SizedBox(height: 20),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const MoodInputScreen()));
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 8,
                        shadowColor: const Color(0xFF8B5CF6).withOpacity(0.4),
                      ),
                      child: const Text('📊 Log Your Mood', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                    ),
                  ),

                  // Secondary Actions
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Expanded(
                          child: _SecondaryButton(
                            text: '📈 View Trends',
                            onTap: () {
                              // Navigate to Trends tab
                              final scaffold = context.findAncestorStateOfType<MainNavState>();
                              scaffold?.switchTab(1);
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _SecondaryButton(
                            text: '⚙️ Settings',
                            onTap: () {
                              final scaffold = context.findAncestorStateOfType<MainNavState>();
                              scaffold?.switchTab(2);
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GaugeWidget extends StatelessWidget {
  final int value;
  final String label;
  const _GaugeWidget({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: 100,
          height: 60,
          child: CustomPaint(
            painter: _GaugePainter(value: value, maxValue: value > 10 ? value : 10),
          ),
        ),
        Text('$value', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      ],
    );
  }
}

class _GaugePainter extends CustomPainter {
  final int value;
  final int maxValue;
  _GaugePainter({required this.value, required this.maxValue});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height);
    final radius = size.width / 2 - 8;

    // Background arc
    final bgPaint = Paint()
      ..color = const Color(0xFF334155)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      3.14159, 3.14159, false, bgPaint,
    );

    // Progress arc
    final percentage = maxValue > 0 ? (value / maxValue).clamp(0.0, 1.0) : 0.0;
    final progressPaint = Paint()
      ..color = const Color(0xFFA78BFA)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      3.14159, 3.14159 * percentage, false, progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _SecondaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  const _SecondaryButton({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF2D3A52)),
        ),
        child: Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

