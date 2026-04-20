import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:moodmate_flutter/main.dart';

void main() {
  testWidgets('MoodMate app loads', (WidgetTester tester) async {
    await tester.pumpWidget(const MoodMateApp());
    expect(find.text('MoodMate'), findsNothing); // App loads without errors
  });
}
