<?php
	$arr = array();
	$arr['plist'][] = array('title'=>'product name1', 'price'=>19.5, 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>$_POST['key'], 'price'=>$_POST['va'], 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>'product name2', 'price'=>10.5, 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>$_POST['key'], 'price'=>$_POST['va'], 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>'product name3', 'price'=>13.0, 'img'=>'images/img.png');
	
	sleep(1);
	echo json_encode($arr);
?>