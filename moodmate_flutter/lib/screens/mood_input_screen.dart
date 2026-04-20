import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/features.dart';
import 'recommendation_screen.dart';

class MoodInputScreen extends StatefulWidget {
  const MoodInputScreen({Key? key}) : super(key: key);

  @override
  State<MoodInputScreen> createState() => _MoodInputScreenState();
}

class _MoodInputScreenState extends State<MoodInputScreen> {
  String? selectedMood;
  int step = 1;

  void _showMeetingRoomPrompt(AppState state) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('📍 Location Detected', style: TextStyle(color: Colors.white)),
        content: const Text("It looks like you're at the Office. Are you in a Meeting Room?", style: TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              state.confirmMeetingRoom(false);
            },
            child: const Text('No, Office', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              state.confirmMeetingRoom(true);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
            child: const Text('Yes, Meeting Room', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }


  void _handleMoodSelect(String mood) {
    setState(() {
      selectedMood = mood;
      step = 2;
    });
  }

  void _handleSubmit() {
    if (selectedMood != null) {
      final state = Provider.of<AppState>(context, listen: false);
      state.addMoodEntry(selectedMood!, state.currentLocation);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => RecommendationScreen(mood: selectedMood!, location: state.currentLocation),
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = Provider.of<AppState>(context, listen: false);
      state.refreshLocation();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (state.needsMeetingRoomConfirmation && step == 2) {
        _showMeetingRoomPrompt(state);
      }
    });

    final selectedMoodData = selectedMood != null
        ? MOODS.cast<MoodOption?>().firstWhere((m) => m!.id == selectedMood, orElse: () => null)
        : null;
    final currentLocationData = LOCATIONS.cast<LocationOption?>().firstWhere(
      (l) => l!.id == state.currentLocation,
      orElse: () => LOCATIONS[0],
    );

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 60, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        step == 1 ? 'How are you feeling?' : 'Your Location',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    step == 1 ? 'Select the mood that best describes you right now' : 'Select your current location',
                    style: const TextStyle(fontSize: 15, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Step Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 80),
              child: Row(
                children: [
                  Container(
                    width: 14, height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFA78BFA),
                      boxShadow: [BoxShadow(color: const Color(0xFFA78BFA).withOpacity(0.6), blurRadius: 6)],
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 3,
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: step >= 2 ? const Color(0xFFA78BFA) : const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(1.5),
                      ),
                    ),
                  ),
                  Container(
                    width: 14, height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: step >= 2 ? const Color(0xFFA78BFA) : const Color(0xFF334155),
                      boxShadow: step >= 2
                          ? [BoxShadow(color: const Color(0xFFA78BFA).withOpacity(0.6), blurRadius: 6)]
                          : null,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            if (step == 1) ...[
              // Mood Selection Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  alignment: WrapAlignment.center,
                  children: MOODS.map((mood) {
                    final isSelected = selectedMood == mood.id;
                    return GestureDetector(
                      onTap: () => _handleMoodSelect(mood.id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: (MediaQuery.of(context).size.width - 48) / 2,
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF2D3A52) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? const Color(0xFFA855F7) : Colors.transparent,
                            width: 2,
                          ),
                          boxShadow: isSelected
                              ? [BoxShadow(color: const Color(0xFFA855F7).withOpacity(0.3), blurRadius: 16)]
                              : null,
                        ),
                        child: Column(
                          children: [
                            Text(mood.emoji, style: const TextStyle(fontSize: 48)),
                            const SizedBox(height: 10),
                            Text(mood.label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                            const SizedBox(height: 10),
                            Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: Color(hexToColor(mood.color)))),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ] else ...[
              // Selected Mood Banner
              if (selectedMoodData != null)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF2D3A52)),
                  ),
                  child: Row(
                    children: [
                      Text(selectedMoodData.emoji, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text('Feeling ${selectedMoodData.label}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white)),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => step = 1),
                        child: const Text('Change', style: TextStyle(color: Color(0xFFA78BFA), fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 16),

              // Location Selection
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA855F7), width: 2),
                  boxShadow: [BoxShadow(color: const Color(0xFFA855F7).withOpacity(0.2), blurRadius: 16)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('📍 Select Location', style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
                        Row(
                          children: [
                            const Text('Manual Override', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                            Switch(
                              value: state.isManualOverride,
                              onChanged: (val) {
                                if (val) {
                                  state.manualOverrideLocation(state.currentLocation);
                                } else {
                                  state.clearManualOverride();
                                }
                              },
                              activeColor: const Color(0xFFA855F7),
                              activeTrackColor: const Color(0xFFA855F7).withOpacity(0.5),
                              inactiveThumbColor: const Color(0xFF64748B),
                              inactiveTrackColor: const Color(0xFF334155),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...LOCATIONS.map((location) {
                      final isSelected = state.currentLocation == location.id;
                      final isAutoDetected = isSelected && !state.isManualOverride;

                      return GestureDetector(
                        onTap: () => state.manualOverrideLocation(location.id),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF2D3A52) : const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? const Color(0xFFA855F7) : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(location.icon, style: const TextStyle(fontSize: 32)),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(location.label, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500, color: Colors.white)),
                                    if (isAutoDetected)
                                      const Text('Auto-detected', style: TextStyle(color: Color(0xFF22C55E), fontSize: 12)),
                                  ],
                                ),
                              ),
                              if (isSelected) const Text('✓', style: TextStyle(fontSize: 20, color: Color(0xFFA78BFA), fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),

              // Submit Button
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: ElevatedButton(
                  onPressed: _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8B5CF6),
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 8,
                    shadowColor: const Color(0xFF8B5CF6).withOpacity(0.5),
                  ),
                  child: const Text('Get Recommendation →', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                ),
              ),
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
