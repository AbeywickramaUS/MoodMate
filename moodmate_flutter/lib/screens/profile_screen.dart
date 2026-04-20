import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../data/features.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _allergyController = TextEditingController();

  void _handleAddAllergy() {
    final trimmed = _allergyController.text.trim();
    if (trimmed.isNotEmpty) {
      final state = Provider.of<AppState>(context, listen: false);
      if (!state.userProfile.allergies.contains(trimmed)) {
        state.updateAllergies([...state.userProfile.allergies, trimmed]);
        _allergyController.clear();
      }
    }
  }

  void _handleRemoveAllergy(String allergy) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Remove Allergy', style: TextStyle(color: Colors.white)),
        content: Text('Remove "$allergy" from your allergies?', style: const TextStyle(color: Color(0xFF94A3B8))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              final state = Provider.of<AppState>(context, listen: false);
              state.updateAllergies(state.userProfile.allergies.where((a) => a != allergy).toList());
              Navigator.pop(ctx);
            },
            child: const Text('Remove', style: TextStyle(color: Color(0xFFEF4444))),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _allergyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final topGoals = USER_GOALS.take(2).toList();
    final bottomGoals = USER_GOALS.skip(2).toList();

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
                  Text('Settings', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
                  SizedBox(height: 4),
                  Text('Customize your experience', style: TextStyle(fontSize: 15, color: Color(0xFF94A3B8))),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Allergies Section
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
                  const Text('🚫 Allergies & Restrictions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 6),
                  const Text('Define any allergies or restrictions so recommendations avoid conflicts.', style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4)),
                  const SizedBox(height: 16),

                  // Input Row
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _allergyController,
                          onSubmitted: (_) => _handleAddAllergy(),
                          style: const TextStyle(color: Colors.white, fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Enter an allergy or restriction...',
                            hintStyle: const TextStyle(color: Color(0xFF64748B)),
                            filled: true,
                            fillColor: const Color(0xFF0F172A),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF8B5CF6))),
                            contentPadding: const EdgeInsets.all(14),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: _handleAddAllergy,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF8B5CF6),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text('+ Add', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Allergies List
                  if (state.userProfile.allergies.isEmpty)
                    const Text('No allergies added', style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontStyle: FontStyle.italic))
                  else
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: state.userProfile.allergies.map((allergy) {
                        return GestureDetector(
                          onTap: () => _handleRemoveAllergy(allergy),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF22C55E).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(allergy, style: const TextStyle(color: Color(0xFF4ADE80), fontSize: 14, fontWeight: FontWeight.w500)),
                                const SizedBox(width: 8),
                                const Text('✕', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 12)),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Goals Section
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
                  const Text('🎯 Preferred Goal', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 6),
                  const Text('Recommendations will be tailored towards this goal', style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4)),
                  const SizedBox(height: 16),

                  // Top row - 2 goals
                  Row(
                    children: topGoals.map((goal) => Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(right: goal == topGoals.first ? 10 : 0, left: goal == topGoals.last ? 10 : 0),
                        child: _GoalCard(
                          goal: goal,
                          isSelected: state.userProfile.preferredGoal == goal.id,
                          onTap: () => state.updatePreferredGoal(goal.id),
                        ),
                      ),
                    )).toList(),
                  ),

                  const SizedBox(height: 10),

                  // Bottom row - 3 goals
                  Row(
                    children: bottomGoals.map((goal) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _GoalCard(
                          goal: goal,
                          isSelected: state.userProfile.preferredGoal == goal.id,
                          onTap: () => state.updatePreferredGoal(goal.id),
                          isSmall: true,
                        ),
                      ),
                    )).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Saved Locations Section
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
                  const Text('📍 Saved Locations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 6),
                  const Text('Save your current GPS location to auto-detect where you are.', style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4)),
                  const SizedBox(height: 16),
                  ...LOCATIONS.map((loc) {
                    final isSaved = state.userProfile.savedLocations.containsKey(loc.id);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isSaved ? const Color(0xFF22C55E).withOpacity(0.5) : const Color(0xFF334155)),
                      ),
                      child: Row(
                        children: [
                          Text(loc.icon, style: const TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(loc.label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                                Text(isSaved ? 'Location saved' : 'Not saved', style: TextStyle(color: isSaved ? const Color(0xFF22C55E) : const Color(0xFF64748B), fontSize: 12)),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              if (isSaved)
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 20),
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (ctx) => AlertDialog(
                                        backgroundColor: const Color(0xFF1E293B),
                                        title: const Text('Delete Location', style: TextStyle(color: Colors.white)),
                                        content: Text('Remove your saved coordinates for "${loc.label}"?', style: const TextStyle(color: Color(0xFF94A3B8))),
                                        actions: [
                                          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                                          TextButton(
                                            onPressed: () {
                                              state.deleteSavedLocation(loc.id);
                                              Navigator.pop(ctx);
                                            },
                                            child: const Text('Delete', style: TextStyle(color: Color(0xFFEF4444))),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                  tooltip: 'Delete location',
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                              if (isSaved) const SizedBox(width: 12),
                              ElevatedButton(
                                onPressed: () => state.saveCurrentLocation(loc.id),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF8B5CF6),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  minimumSize: Size.zero,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: Text(isSaved ? 'Update' : 'Save', style: const TextStyle(fontSize: 13, color: Colors.white)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),

            const SizedBox(height: 20),
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
                  const Text('ℹ️ About MoodMate', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Column(
                      children: [
                        Text(
                          'MoodMate is your personal well-being companion. It monitors your emotional state and provides adaptive recommendations to help you feel better.',
                          style: TextStyle(fontSize: 14, color: Color(0xFF94A3B8), height: 1.6),
                        ),
                        SizedBox(height: 12),
                        Text('Version 1.0.0', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      ],
                    ),
                  ),
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

class _GoalCard extends StatelessWidget {
  final UserGoalOption goal;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isSmall;

  const _GoalCard({
    required this.goal,
    required this.isSelected,
    required this.onTap,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.all(isSmall ? 14 : 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2D3A52) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFFA855F7) : Colors.transparent,
            width: 2,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: const Color(0xFFA855F7).withOpacity(0.3), blurRadius: 10)]
              : null,
        ),
        child: Stack(
          children: [
            Column(
              children: [
                Text(goal.icon, style: TextStyle(fontSize: isSmall ? 28 : 32)),
                SizedBox(height: isSmall ? 6 : 8),
                Text(goal.label, textAlign: TextAlign.center, style: TextStyle(fontSize: isSmall ? 12 : 13, fontWeight: FontWeight.w600, color: Colors.white)),
              ],
            ),
            if (isSelected)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  width: isSmall ? 20 : 22,
                  height: isSmall ? 20 : 22,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF22C55E)),
                  child: const Center(child: Text('✓', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
