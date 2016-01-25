<?php
	$arr = array();
	$arr['plist'][] = array('title'=>'产品名称', 'price'=>19.5, 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>$_POST['key'], 'price'=>$_POST['va'], 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>'产品名称', 'price'=>19.5, 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>$_POST['key'], 'price'=>$_POST['va'], 'img'=>'images/img.png');
	$arr['plist'][] = array('title'=>'产品名称', 'price'=>19.5, 'img'=>'images/img.png');
	
	sleep(2);
	echo json_encode($arr);
?>
